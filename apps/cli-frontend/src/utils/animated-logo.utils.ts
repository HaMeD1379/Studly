// filepath: apps/cli-frontend/src/utils/animated-logo.utils.ts
/**
 * ────────────────────────────────────────────────────────────────────────────────
 *  File: src/utils/animated-logo.utils.ts
 *  Project: Studly — CLI Frontend
 *  Designer/Prompter: Hamed Esmaeilzadeh
 *  Implemented-by: Gemini 3 and Claude 4.5
 *  Comments-by: Gemini 3 and Claude 4.5
 *  Last-Updated: 2025-11-26
 *  @designer Hamed Esmaeilzadeh
 *  @prompter Hamed Esmaeilzadeh
 *  @implemented-by Gemini 3 and Claude 4.5
 *  @comments-by Gemini 3 and Claude 4.5
 * ────────────────────────────────────────────────────────────────────────────────
 *  Summary
 *  -------
 *  Animated ASCII logo with sweeping transition effect from # to @ and back.
 *  Creates a visual "scanning" effect across the logo.
 *
 *  @module utils/animated-logo
 * ────────────────────────────────────────────────────────────────────────────────
 */

// tags: Studly, CLI, TypeScript

const LOGO_LINES = [
  ' #######    #########   ###    ###   #######     ###       ###     ###   ###',
  '###    ##      ###      ###    ###   ###   ###   ###       ###     ###   ###',
  '###            ###      ###    ###   ###    ###  ###        ###   ###    ###',
  ' #######       ###      ###    ###   ###    ###  ###         #######     ###',
  '       ###     ###      ###    ###   ###    ###  ###           ###        ',
  '##     ###     ###      ###    ###   ###   ###   ###           ###       ###',
  ' #######       ###       ########    #######     #########     ###       ###',
];

export class AnimatedLogo {
  private currentFrame: string[] = [];
  private sweepPosition = 0;
  private direction: 'forward' | 'backward' | 'pause' = 'pause';
  private pauseCounter = 0;
  private pauseDuration = 30; // Frames to pause (shorter pause)
  private sweepSpeed = 3; // Faster sweep - 4 characters per frame

  constructor() {
    // Initialize with # version
    this.currentFrame = LOGO_LINES.map(line => line);
  }

  /**
   * Get the current frame of the animation
   */
  getCurrentFrame(): string[] {
    return this.currentFrame;
  }

  /**
   * Update the animation to the next frame
   */
  update(): void {
    // Handle pause state
    if (this.direction === 'pause') {
      this.pauseCounter++;
      if (this.pauseCounter >= this.pauseDuration) {
        this.pauseCounter = 0;
        this.startNextCycle();
      }
      return;
    }

    // Get the max width of the logo
    const maxWidth = Math.max(...LOGO_LINES.map(line => line.length));

    if (this.direction === 'forward') {
      // Sweep from left to right, changing # to @
      this.sweepPosition += this.sweepSpeed;

      this.currentFrame = LOGO_LINES.map((line, lineIndex) => {
        let newLine = '';
        const currentLine = this.currentFrame[lineIndex] || line;

        for (let i = 0; i < line.length; i++) {
          if (i < this.sweepPosition) {
            // Already swept - change # to @
            newLine += line[i] === '#' ? '@' : line[i];
          } else {
            // Not swept yet - use current state
            newLine += currentLine[i] || line[i];
          }
        }
        return newLine;
      });

      // Check if sweep is complete
      if (this.sweepPosition >= maxWidth) {
        this.direction = 'pause';
        this.pauseCounter = 0;
        this.sweepPosition = 0;
      }
    } else if (this.direction === 'backward') {
      // Sweep from RIGHT to LEFT, changing @ back to #
      this.sweepPosition += this.sweepSpeed;

      this.currentFrame = LOGO_LINES.map((line, lineIndex) => {
        let newLine = '';
        const currentLine = this.currentFrame[lineIndex];
        const lineLength = line.length;

        for (let i = 0; i < lineLength; i++) {
          // Calculate distance from right edge
          const distanceFromRight = lineLength - i;

          if (distanceFromRight <= this.sweepPosition) {
            // Vertical line has passed (coming from right) - change back to original
            newLine += line[i];
          } else {
            // Vertical line hasn't reached here yet - keep current state (@)
            newLine += currentLine[i];
          }
        }
        return newLine;
      });

      // Check if sweep is complete
      if (this.sweepPosition >= maxWidth) {
        this.direction = 'pause';
        this.pauseCounter = 0;
        this.sweepPosition = 0;
      }
    }
  }

  /**
   * Start the next sweep cycle
   */
  private startNextCycle(): void {
    // Toggle between forward and backward
    if (this.currentFrame[0] && this.currentFrame[0].includes('@')) {
      this.direction = 'backward';
    } else {
      this.direction = 'forward';
    }
    this.sweepPosition = 0;
  }

  /**
   * Reset the animation
   */
  reset(): void {
    this.currentFrame = LOGO_LINES.map(line => line);
    this.sweepPosition = 0;
    this.direction = 'pause';
    this.pauseCounter = 0;
  }

  /**
   * Render the logo with optional color
   */
  render(color: string = '\x1b[36m'): string {
    const lines = this.getCurrentFrame();
    return lines.map(line => color + line + '\x1b[0m').join('\n');
  }
}

/**
 * Global instance for the interactive mode
 */
let globalLogoInstance: AnimatedLogo | null = null;

/**
 * Get or create the global logo instance
 */
export function getAnimatedLogo(): AnimatedLogo {
  if (!globalLogoInstance) {
    globalLogoInstance = new AnimatedLogo();
  }
  return globalLogoInstance;
}

/**
 * Reset the global logo instance
 */
export function resetAnimatedLogo(): void {
  if (globalLogoInstance) {
    globalLogoInstance.reset();
  }
}
