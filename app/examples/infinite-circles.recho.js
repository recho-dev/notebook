/**
 * @title Infinite Circles
 * @author Jack B. Du
 * @github jackbdu
 * @created 2025-10-13
 * @pull_request 162
 * @thumbnail_start 33
 */

/**
 * ============================================================================
 * =                         Infinite Circles                                 =
 * ============================================================================
 */

const backgroundChars = '{------}';
const foregroundChars = '{CIRCLE}';

const circleFrequency = recho.number(4, {min: 1, max: 6, step: 1});
const animationRate = recho.number(1, {min: 1, max: 4, step: 1});

const cols = 75;
const rows = 18;
const aspectRatio = cols/rows*0.5;

const frameRate = 60;
const loopFrames = Math.floor(30/animationRate);
const frameCount = recho.interval(1000/frameRate);
const progress = (frameCount) => frameCount%loopFrames/loopFrames;

const TAU = Math.PI*2;

//➜ {---CLE}{------}{CIRC--}{---CLE}{CIRCLE}{CIRCLE}{------}{CIRC--}{--RCLE}{--
//➜ ---}{CIR---}{CIRCLE}{----LE}{CIRCLE}{CIRCLE}{CIRCLE}{----LE}{CI----}{CIRC--
//➜ {-IRCLE}{---CLE}{------}{CIRCL-}{------}{-----E}{CIRC--}{--RCLE}{----LE}{C-
//➜ --E}{C-----}{CIR---}{-IRCLE}{------}{------}{---CLE}{C-----}{CIRC--}{-IRCL-
//➜ {CIRCL-}{-IRCLE}{---CLE}{C-----}{CIRCLE}{CI----}{-IRCLE}{----LE}{C----E}{CI
//➜ CLE}{-----E}{C-----}{CIR---}{-IRCLE}{CIRCLE}{C-----}{CIRC--}{-IRCL-}{--RCLE
//➜ {CIRC--}{CIRCL-}{--RCLE}{---CLE}{CI----}{CIRCLE}{----LE}{-----E}{CI----}{CI
//➜ CLE}{----LE}{-----E}{CI----}{CIR---}{------}{CIRC--}{CIRCL-}{--RCLE}{---CLE
//➜ {CIR---}{CIRC--}{-IRCL-}{--RCLE}{----LE}{----LE}{-----E}{C-----}{CI----}{CI
//➜ CLE}{----LE}{-----E}{C-----}{CI----}{CIR---}{CIRC--}{-IRCL-}{--RCLE}{---CLE
//➜ {CIR---}{CIRC--}{-IRCL-}{--RCLE}{----LE}{----LE}{-----E}{C-----}{CI----}{CI
//➜ CLE}{----LE}{-----E}{CI----}{CIR---}{------}{CIRC--}{CIRCL-}{--RCLE}{---CLE
//➜ {CIRC--}{CIRCL-}{--RCLE}{---CLE}{CI----}{CIRCLE}{----LE}{-----E}{CI----}{CI
//➜ CLE}{-----E}{C-----}{CIR---}{-IRCLE}{CIRCLE}{C-----}{CIRC--}{-IRCL-}{--RCLE
//➜ {CIRCL-}{-IRCLE}{---CLE}{C-----}{CIRCLE}{CI----}{-IRCLE}{----LE}{C----E}{CI
//➜ --E}{C-----}{CIR---}{-IRCLE}{------}{------}{---CLE}{C-----}{CIRC--}{-IRCL-
//➜ {-IRCLE}{---CLE}{------}{CIRCL-}{------}{-----E}{CIRC--}{--RCLE}{----LE}{C-
//➜ ---}{CIR---}{CIRCLE}{----LE}{CIRCLE}{CIRCLE}{CIRCLE}{----LE}{CI----}{CIRC--
{
  const text = new Array(rows).fill(0).map((_,r,rowArray)=>{
    
    return new Array(cols).fill(0).map((_,c,colArray)=>{

      const t = progress(frameCount);
      const y = r/rowArray.length-0.5;
      const x = (c/colArray.length-0.5)*aspectRatio;
      
      const backgroundCharOffset = r*Math.floor(backgroundChars.length/2);
      const backgroundCharIndex = (c+backgroundCharOffset)%backgroundChars.length;
      const foregroundCharOffset = r*Math.floor(foregroundChars.length/2);
      const foregroundCharIndex = (c+foregroundCharOffset)%foregroundChars.length;

      const radius = Math.sqrt(x*x+y*y);
      const char = Math.sin(radius*TAU*circleFrequency+t*TAU) > 0 ?
        backgroundChars[backgroundCharIndex] : foregroundChars[foregroundCharIndex];
      
      return char;

    }).join('');
    
  }).join('\n');
  
  echo(text);
}
