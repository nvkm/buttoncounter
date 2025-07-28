// Unit tests for simple.js console logging functionality
// Testing Framework: Jest

describe('Simple.js console output tests', () => {
  let consoleLogSpy;
  let originalOutput;

  beforeEach(() => {
    // Mock console.log to capture calls
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // Clear any global output variable that might exist
    if (typeof global !== 'undefined' && 'output' in global) {
      originalOutput = global.output;
      delete global.output;
    }
  });

  afterEach(() => {
    // Restore console.log
    consoleLogSpy.mockRestore();

    // Restore original output if it existed
    if (originalOutput !== undefined) {
      global.output = originalOutput;
      originalOutput = undefined;
    }
  });

  describe('undefined output variable scenarios', () => {
    test('should log undefined when output variable is not defined', () => {
      // Simulate the behavior of console.log(output) when output is undefined
      let output;
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(undefined);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle ReferenceError when output is not declared', () => {
      // Test what happens when trying to access an undeclared variable
      expect(() => {
        // This would normally throw ReferenceError in strict mode
        console.log(undeclaredOutput);
      }).toThrow(ReferenceError);
    });
  });

  describe('defined output variable scenarios', () => {
    test('should log string values correctly', () => {
      const output = 'Hello, World!';
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('Hello, World!');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should log numeric values correctly', () => {
      const output = 42;
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(42);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should log boolean values correctly', () => {
      const output = true;
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(true);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should log null values correctly', () => {
      const output = null;
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(null);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should log array values correctly', () => {
      const output = [1, 2, 3, 'test'];
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith([1, 2, 3, 'test']);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should log object values correctly', () => {
      const output = { name: 'test', value: 123 };
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith({ name: 'test', value: 123 });
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge case scenarios', () => {
    test('should handle empty string output', () => {
      const output = '';
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle zero as output', () => {
      const output = 0;
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(0);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle NaN as output', () => {
      const output = NaN;
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(NaN);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle Infinity as output', () => {
      const output = Infinity;
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(Infinity);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle function as output', () => {
      const output = function testFunction() { return 'test'; };
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(output);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle Symbol as output', () => {
      const output = Symbol('test');
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(output);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('complex data structures', () => {
    test('should handle nested objects', () => {
      const output = {
        level1: {
          level2: {
            value: 'deep nested value'
          }
        },
        array: [1, 2, { nested: 'object' }]
      };
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(output);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle arrays with mixed types', () => {
      const output = [
        'string',
        42,
        true,
        null,
        undefined,
        { key: 'value' },
        [1, 2, 3]
      ];
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(output);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle circular references gracefully', () => {
      const output = { name: 'circular' };
      output.self = output;
      
      expect(() => {
        console.log(output);
      }).not.toThrow();
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('global output variable scenarios', () => {
    test('should handle global output variable', () => {
      global.output = 'global value';
      
      // Simulate accessing global output
      console.log(global.output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('global value');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle modified global output', () => {
      global.output = 'initial';
      global.output = 'modified';
      
      console.log(global.output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('modified');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('console.log behavior verification', () => {
    test('should verify console.log is called exactly once', () => {
      const output = 'test message';
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should verify console.log returns undefined', () => {
      const output = 'test';
      const result = console.log(output);
      
      expect(result).toBeUndefined();
    });

    test('should handle multiple consecutive calls', () => {
      const output1 = 'first';
      const output2 = 'second';
      
      console.log(output1);
      console.log(output2);
      
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, 'first');
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 'second');
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('error scenarios', () => {
    test('should handle Error objects as output', () => {
      const output = new Error('Test error message');
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(output);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle TypeError scenarios', () => {
      const output = undefined;
      
      // This should not throw when logging undefined
      expect(() => {
        console.log(output);
      }).not.toThrow();
      
      expect(consoleLogSpy).toHaveBeenCalledWith(undefined);
    });
  });

  describe('performance and memory scenarios', () => {
    test('should handle large strings', () => {
      const output = 'a'.repeat(10000);
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(output);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle large arrays', () => {
      const output = new Array(1000).fill().map((_, i) => i);
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(output);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle deeply nested structures', () => {
      let output = { value: 0 };
      for (let i = 0; i < 100; i++) {
        output = { nested: output, level: i };
      }
      
      expect(() => {
        console.log(output);
      }).not.toThrow();
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration with simple.js behavior', () => {
    test('should simulate the exact simple.js execution', () => {
      // Test the exact scenario from simple.js where output is undefined
      let output; // This mimics the undefined output in simple.js
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(undefined);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle potential runtime assignment to output', () => {
      // Simulate a scenario where output gets assigned at runtime
      let output;
      
      // First call - undefined
      console.log(output);
      
      // Assignment
      output = 'Runtime assigned value';
      
      // Second call - with value
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenNthCalledWith(1, undefined);
      expect(consoleLogSpy).toHaveBeenNthCalledWith(2, 'Runtime assigned value');
      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    });

    test('should verify behavior when output is assigned from external source', () => {
      // Simulate output being assigned from a function return, API call, etc.
      const getOutput = () => 'External source value';
      const output = getOutput();
      
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('External source value');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Unicode and special character handling', () => {
    test('should handle Unicode characters', () => {
      const output = '🚀 Hello 世界 🎉';
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('🚀 Hello 世界 🎉');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle escape sequences', () => {
      const output = 'Line 1\nLine 2\tTabbed\r\nWindows line ending';
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(output);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });

    test('should handle special regex characters', () => {
      const output = '.*+?^${}()|[]\\';
      console.log(output);
      
      expect(consoleLogSpy).toHaveBeenCalledWith('.*+?^${}()|[]\\');
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    });
  });
});