const fs = require('fs');
const path = require('path');

describe('README.md Validation Tests', () => {
  let readmeContent;
  let readmePath;

  beforeAll(() => {
    readmePath = path.join(__dirname, 'README.md');
    expect(fs.existsSync(readmePath)).toBe(true);
    readmeContent = fs.readFileSync(readmePath, 'utf8');
  });

  describe('File Structure and Format', () => {
    test('should exist and be readable', () => {
      expect(readmeContent).toBeDefined();
      expect(readmeContent.length).toBeGreaterThan(0);
      expect(typeof readmeContent).toBe('string');
    });

    test('should have proper markdown formatting', () => {
      // Check for basic markdown elements
      expect(readmeContent).toMatch(/^#\s+/m); // At least one heading
      expect(readmeContent).not.toMatch(/^\s*#\s*$/m); // No empty headings
    });

    test('should have consistent line endings', () => {
      // Ensure consistent line endings (no mixed \r\n and \n)
      const hasWindowsLineEndings = readmeContent.includes('\r\n');
      const hasUnixLineEndings = readmeContent.includes('\n') && !readmeContent.includes('\r\n');
      expect(hasWindowsLineEndings && hasUnixLineEndings).toBe(false);
    });

    test('should not be empty or contain only whitespace', () => {
      expect(readmeContent.trim()).not.toBe('');
      expect(readmeContent.length).toBeGreaterThan(10);
    });

    test('should be UTF-8 encoded', () => {
      // Test for common UTF-8 encoding issues
      expect(readmeContent).not.toContain('\uFFFD'); // Replacement character
      expect(readmeContent).not.toMatch(/\p{Cc}/u); // Control characters
    });
  });

  describe('Content Structure and Validation', () => {
    test('should have a meaningful title', () => {
      const titleMatch = readmeContent.match(/^#\s+(.+)$/m);
      expect(titleMatch).toBeTruthy();
      expect(titleMatch[1].trim()).toBe('Button counter');
      expect(titleMatch[1].length).toBeGreaterThan(3);
      expect(titleMatch[1]).not.toMatch(/^\s+|\s+$/); // No leading/trailing whitespace
    });

    test('should contain an Images section', () => {
      expect(readmeContent).toMatch(/###\s+Images/);
      const imagesSection = readmeContent.match(/###\s+Images/);
      expect(imagesSection).toBeTruthy();
    });

    test('should have proper heading hierarchy', () => {
      const headings = readmeContent.match(/^#+\s+.+$/gm) || [];
      expect(headings.length).toBe(2); // Exactly 2 headings
      
      // Check that h1 comes before h3
      const h1Index = readmeContent.indexOf('# Button counter');
      const h3Index = readmeContent.indexOf('### Images');
      expect(h1Index).toBeLessThan(h3Index);
      expect(h1Index).toBe(0); // Should start at beginning
    });

    test('should have consistent heading format', () => {
      const headings = readmeContent.match(/^#+\s+.+$/gm) || [];
      headings.forEach(heading => {
        // Each heading should have space after hash(es)
        expect(heading).toMatch(/^#+\s+\S/);
        // Should not have trailing whitespace
        expect(heading).not.toMatch(/\s+$/);
      });
    });
  });

  describe('Images and Links Validation', () => {
    test('should contain exactly two image references', () => {
      const imagePattern = /!\[([^\]]*)\]\(([^)]+)\)/g;
      const images = [...readmeContent.matchAll(imagePattern)];
      
      expect(images.length).toBe(2);
      
      images.forEach((match, index) => {
        const [fullMatch, altText, url] = match;
        
        // Test that each image has proper format
        expect(url).toBeTruthy();
        expect(url.trim()).not.toBe('');
        expect(url).not.toContain(' '); // URLs should not contain spaces
        
        // Alt text should be defined
        expect(altText).toBeDefined();
      });
    });

    test('should have valid GitHub user-images URL format', () => {
      const githubImagePattern = /https:\/\/user-images\.githubusercontent\.com\/55393733\/140798385-dbdc4b1f-aa1d-42d8-9129-9fb2ba6e03a9\.png/;
      expect(readmeContent).toMatch(githubImagePattern);
      
      // Verify specific GitHub image URL structure
      const githubMatch = readmeContent.match(githubImagePattern);
      expect(githubMatch).toBeTruthy();
      expect(githubMatch[0]).toContain('user-images.githubusercontent.com');
      expect(githubMatch[0]).toContain('55393733'); // Specific user ID
    });

    test('should have valid CodeRabbit badge URL', () => {
      const coderabbitPattern = /https:\/\/img\.shields\.io\/coderabbit\/prs\/github\/nvkm\/buttoncounter/;
      expect(readmeContent).toMatch(coderabbitPattern);
      
      const badgeMatch = readmeContent.match(coderabbitPattern);
      expect(badgeMatch[0]).toContain('img.shields.io/coderabbit');
      expect(badgeMatch[0]).toContain('nvkm/buttoncounter');
    });

    test('should have properly formatted shield.io badge', () => {
      const badgeMatch = readmeContent.match(/!\[CodeRabbit Pull Request Reviews\]\((https:\/\/img\.shields\.io\/[^)]+)\)/);
      expect(badgeMatch).toBeTruthy();
      
      const badgeUrl = badgeMatch[1];
      expect(badgeUrl).toContain('coderabbit/prs/github/nvkm/buttoncounter');
      expect(badgeUrl).toContain('utm_source=oss');
      expect(badgeUrl).toContain('utm_medium=github');
      expect(badgeUrl).toContain('utm_campaign=nvkm%2Fbuttoncounter');
      expect(badgeUrl).toContain('labelColor=171717');
      expect(badgeUrl).toContain('color=FF570A');
      expect(badgeUrl).toContain('link=https%3A%2F%2Fcoderabbit.ai');
      expect(badgeUrl).toContain('label=CodeRabbit+Reviews');
    });

    test('should have valid image alt text', () => {
      const images = [...readmeContent.matchAll(/!\[([^\]]*)\]\([^)]+\)/g)];
      
      // First image has "image" as alt text
      expect(images[0][1]).toBe('image');
      
      // Second image has "CodeRabbit Pull Request Reviews" as alt text
      expect(images[1][1]).toBe('CodeRabbit Pull Request Reviews');
      expect(images[1][1]).toContain('CodeRabbit');
      expect(images[1][1].length).toBeGreaterThan(5);
    });

    test('should have images positioned correctly in document structure', () => {
      const imagesSectionIndex = readmeContent.indexOf('### Images');
      const firstImageIndex = readmeContent.indexOf('![image]');
      const secondImageIndex = readmeContent.indexOf('![CodeRabbit');
      
      expect(imagesSectionIndex).toBeGreaterThan(0);
      expect(firstImageIndex).toBeGreaterThan(imagesSectionIndex);
      expect(secondImageIndex).toBeGreaterThan(firstImageIndex);
    });
  });

  describe('Content Quality and Best Practices', () => {
    test('should not have trailing whitespace', () => {
      const lines = readmeContent.split('\n');
      lines.forEach((line, index) => {
        expect(line).not.toMatch(/\s+$/);
      });
    });

    test('should handle empty lines appropriately', () => {
      const lines = readmeContent.split('\n');
      
      // Should have exactly 2 empty lines based on the content
      const emptyLines = lines.filter(line => line.trim() === '');
      expect(emptyLines.length).toBe(2);
      
      // Should not have excessive consecutive empty lines (more than 2)
      expect(readmeContent).not.toMatch(/\n\s*\n\s*\n\s*\n/);
    });

    test('should have appropriate content structure', () => {
      // Should start with title
      expect(readmeContent.trim()).toMatch(/^#\s+Button counter/);
      
      // Should have Images section
      expect(readmeContent).toContain('### Images');
      
      // Should have actual images after the Images section
      const imagesSectionIndex = readmeContent.indexOf('### Images');
      const contentAfterImages = readmeContent.substring(imagesSectionIndex);
      expect(contentAfterImages).toMatch(/!\[/); // Should contain image markdown
    });

    test('should have proper markdown link syntax', () => {
      const links = [...readmeContent.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
      
      links.forEach(link => {
        const [fullMatch, altText, url] = link;
        
        // Should not have malformed brackets or parentheses
        expect(fullMatch).toMatch(/^!\[[^\]]*\]\([^)]+\)$/);
        
        // URL should be valid format
        expect(url).toMatch(/^https:\/\//);
      });
    });

    test('should maintain consistent spacing', () => {
      const lines = readmeContent.split('\n');
      
      // Check spacing around headings
      lines.forEach((line, index) => {
        if (line.match(/^#+\s/)) {
          // Skip first line
          if (index > 0) {
            const prevLine = lines[index - 1];
            // Main title should be at start, Images section should have empty line before
            if (line.includes('### Images')) {
              expect(prevLine.trim()).toBe('');
            }
          }
        }
      });
    });
  });

  describe('URL Accessibility and Format Validation', () => {
    test('should have HTTPS URLs for all external links', () => {
      const urlPattern = /https?:\/\/[^\s)]+/g;
      const urls = [...readmeContent.matchAll(urlPattern)];
      
      expect(urls.length).toBe(2); // Two URLs in the document
      
      urls.forEach((match) => {
        const url = match[0];
        expect(url).toMatch(/^https:/);
        expect(url).not.toMatch(/^http:[^s]/); // Should not use HTTP
      });
    });

    test('should have valid query parameters in CodeRabbit badge URL', () => {
      const badgeUrlMatch = readmeContent.match(/https:\/\/img\.shields\.io\/[^)]+/);
      expect(badgeUrlMatch).toBeTruthy();
      
      const badgeUrl = badgeUrlMatch[0];
      const [baseUrl, queryString] = badgeUrl.split('?');
      
      expect(baseUrl).toBeTruthy();
      expect(queryString).toBeTruthy();
      
      const params = queryString.split('&');
      expect(params.length).toBeGreaterThan(5); // Multiple parameters expected
      
      params.forEach(param => {
        expect(param).toMatch(/^[^=]+=.*/); // Should have key=value format
        expect(param).not.toMatch(/^=/); // Should not start with =
        expect(param).not.toMatch(/=$/); // Should not end with = only
      });
    });

    test('should have proper URL encoding in query parameters', () => {
      const badgeUrl = readmeContent.match(/https:\/\/img\.shields\.io\/[^)]+/)[0];
      
      // Check that special characters are properly encoded
      expect(badgeUrl).toContain('%2F'); // Encoded forward slash in utm_campaign
      expect(badgeUrl).toContain('%3A'); // Encoded colon in link parameter
      expect(badgeUrl).toContain('%2B'); // Encoded plus sign in label
      
      // Should not contain unencoded spaces
      expect(badgeUrl).not.toContain(' ');
    });

    test('should have accessible and valid URLs', () => {
      const urls = [...readmeContent.matchAll(/https:\/\/[^\s)]+/g)];
      
      urls.forEach((match) => {
        const url = match[0];
        
        // Should be well-formed URLs
        expect(() => new URL(url)).not.toThrow();
        
        // Should use standard ports (implied by HTTPS)
        expect(url).not.toMatch(/:80\b/); // No explicit HTTP port
        expect(url).not.toMatch(/:443\b/); // No explicit HTTPS port (redundant)
      });
    });
  });

  describe('Project-Specific Content Validation', () => {
    test('should reference the correct project name', () => {
      expect(readmeContent.toLowerCase()).toContain('button counter');
      expect(readmeContent).toMatch(/Button counter/); // Exact case match
    });

    test('should have CodeRabbit integration properly configured', () => {
      const coderabbitBadge = readmeContent.match(/CodeRabbit Pull Request Reviews/);
      expect(coderabbitBadge).toBeTruthy();
      
      const badgeUrl = readmeContent.match(/github\/nvkm\/buttoncounter/);
      expect(badgeUrl).toBeTruthy();
      
      // Should have proper repository reference
      expect(readmeContent).toContain('nvkm/buttoncounter');
    });

    test('should have proper marketing attribution in CodeRabbit badge', () => {
      const badgeMatch = readmeContent.match(/utm_campaign=([^&)]+)/);
      expect(badgeMatch).toBeTruthy();
      expect(decodeURIComponent(badgeMatch[1])).toBe('nvkm/buttoncounter');
      
      // Check all UTM parameters
      expect(readmeContent).toContain('utm_source=oss');
      expect(readmeContent).toContain('utm_medium=github');
    });

    test('should have consistent project branding', () => {
      // Project name should appear in title
      expect(readmeContent).toContain('Button counter');
      
      // URL should match project name (with different formatting)
      expect(readmeContent).toContain('buttoncounter'); // URL format (no space)
    });

    test('should reference correct GitHub user and repository', () => {
      // Check user ID in GitHub image URL
      expect(readmeContent).toContain('55393733');
      
      // Check repository path
      expect(readmeContent).toContain('nvkm/buttoncounter');
    });
  });

  describe('Accessibility and Standards Compliance', () => {
    test('should have appropriate alt text for images', () => {
      const images = [...readmeContent.matchAll(/!\[([^\]]*)\]\([^)]+\)/g)];
      
      expect(images.length).toBe(2);
      
      // First image has basic alt text
      expect(images[0][1]).toBe('image');
      
      // Second image has descriptive alt text
      expect(images[1][1]).toBe('CodeRabbit Pull Request Reviews');
      expect(images[1][1]).toContain('CodeRabbit');
      expect(images[1][1].length).toBeGreaterThan(5);
    });

    test('should not have broken markdown syntax', () => {
      // Check for unmatched brackets
      const openBrackets = (readmeContent.match(/\[/g) || []).length;
      const closeBrackets = (readmeContent.match(/\]/g) || []).length;
      expect(openBrackets).toBe(closeBrackets);

      // Check for unmatched parentheses in markdown links
      const markdownLinks = [...readmeContent.matchAll(/!\[[^\]]*\]\([^)]*\)/g)];
      markdownLinks.forEach(link => {
        const linkText = link[0];
        const openParens = (linkText.match(/\(/g) || []).length;
        const closeParens = (linkText.match(/\)/g) || []).length;
        expect(openParens).toBe(closeParens);
      });
    });

    test('should follow markdown best practices', () => {
      // Headers should have space after #
      const badHeaders = readmeContent.match(/^#+[^\s]/gm);
      expect(badHeaders).toBeNull(); // Should not find headers without space
      
      // Should not have tabs (use spaces for consistency)
      expect(readmeContent).not.toContain('\t');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle file structure appropriately', () => {
      // Test that sections exist and are properly structured
      const sections = readmeContent.split(/^#+\s/m).filter(s => s.trim());
      expect(sections.length).toBe(3); // Title content, Images header, Images content
    });

    test('should not contain placeholder text', () => {
      const placeholders = [
        'TODO', 'FIXME', 'XXX', 'PLACEHOLDER',
        'Your Project Name', '[Project Name]',
        'example.com', 'your-username', 'INSERT_', 'REPLACE_',
        'Lorem ipsum', 'Sample text'
      ];
      
      placeholders.forEach(placeholder => {
        expect(readmeContent.toLowerCase()).not.toContain(placeholder.toLowerCase());
      });
    });

    test('should handle special characters in URLs correctly', () => {
      const urls = [...readmeContent.matchAll(/https:\/\/[^\s)]+/g)];
      
      urls.forEach((match) => {
        const url = match[0];
        
        // Should not contain unencoded spaces
        expect(url).not.toContain(' ');
        
        // Should not have malformed percent encoding
        expect(url).not.toMatch(/%[^0-9A-Fa-f]/);
        expect(url).not.toMatch(/%[0-9A-Fa-f][^0-9A-Fa-f]/);
        
        // Should not end with incomplete encoding
        expect(url).not.toMatch(/%$/);
        expect(url).not.toMatch(/%[0-9A-Fa-f]$/);
      });
    });

    test('should handle malformed markdown gracefully', () => {
      // Test that image syntax is complete
      const incompleteImages = readmeContent.match(/!\[[^\]]*\]\s*$/m);
      expect(incompleteImages).toBeNull();
      
      // Test that there are no hanging brackets
      const lines = readmeContent.split('\n');
      lines.forEach(line => {
        if (line.includes('![')) {
          expect(line).toMatch(/!\[[^\]]*\]\([^)]+\)/);
        }
      });
    });

    test('should not have duplicate content', () => {
      // Check for duplicate images
      const imageUrls = [...readmeContent.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(match => match[1]);
      const uniqueUrls = [...new Set(imageUrls)];
      expect(imageUrls.length).toBe(uniqueUrls.length);
      
      // Check for duplicate headings
      const headings = readmeContent.match(/^#+\s+(.+)$/gm) || [];
      const headingTexts = headings.map(h => h.replace(/^#+\s+/, ''));
      const uniqueHeadings = [...new Set(headingTexts)];
      expect(headingTexts.length).toBe(uniqueHeadings.length);
    });
  });

  describe('Performance and Optimization', () => {
    test('should not be excessively large', () => {
      // README should be concise - current content is about 400 bytes
      expect(readmeContent.length).toBeLessThan(1000); // 1KB limit for this simple README
      
      // Should not have excessive empty lines
      const emptyLines = readmeContent.split('\n').filter(line => line.trim() === '');
      const totalLines = readmeContent.split('\n').length;
      expect(emptyLines.length / totalLines).toBeLessThan(0.4); // Less than 40% empty lines
    });

    test('should have optimized image references', () => {
      const images = [...readmeContent.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)];
      
      images.forEach((match) => {
        const url = match[1];
        
        // Should use appropriate image formats
        expect(url).toMatch(/\.(png|svg)(\?|$)/i);
        
        // Should not reference overly long URLs (potential performance issue)
        expect(url.length).toBeLessThan(500);
      });
    });

    test('should have reasonable line length', () => {
      const lines = readmeContent.split('\n');
      
      lines.forEach((line, index) => {
        // Most lines should be reasonably short (URLs can be longer)
        if (!line.includes('https://')) {
          expect(line.length).toBeLessThan(80);
        } else {
          // Even URL lines shouldn't be excessively long
          expect(line.length).toBeLessThan(500);
        }
      });
    });
  });

  describe('Semantic and Contextual Validation', () => {
    test('should have meaningful section organization', () => {
      // Title should come first
      const titleIndex = readmeContent.indexOf('# Button counter');
      expect(titleIndex).toBe(0);
      
      // Images section should follow
      const imagesSectionIndex = readmeContent.indexOf('### Images');
      expect(imagesSectionIndex).toBeGreaterThan(titleIndex);
      
      // Images should be in the Images section
      const firstImageIndex = readmeContent.indexOf('![');
      expect(firstImageIndex).toBeGreaterThan(imagesSectionIndex);
    });

    test('should have contextually appropriate content', () => {
      // Should be about a button counter project
      expect(readmeContent.toLowerCase()).toContain('button');
      expect(readmeContent.toLowerCase()).toContain('counter');
      
      // Should include visual representation (images)
      expect(readmeContent).toContain('Images');
      
      // Should include project status/badges
      expect(readmeContent).toContain('CodeRabbit');
    });

    test('should maintain professional presentation', () => {
      // Should not contain informal language or slang
      const informalWords = ['lol', 'omg', 'wow', 'cool', 'awesome', 'neat'];
      informalWords.forEach(word => {
        expect(readmeContent.toLowerCase()).not.toContain(word);
      });
      
      // Should use proper capitalization
      expect(readmeContent).toMatch(/^#\s+[A-Z]/m); // Title should be capitalized
    });
  });
});