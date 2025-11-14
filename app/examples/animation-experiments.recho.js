/**
 * @title Animation Experiments
 * @author Jack B. Du
 * @github jackbdu
 * @created 2025-10-14
 * @pull_request 163
 * @thumbnail_start 71
 * @label ASCII Art
 */

/**
 * ============================================================================
 * =                          Animation Experiments                           =
 * ============================================================================
 * 
 * This is a series of animation experiments I created in Recho.
 */

const TAU = Math.PI*2;

const animationRate = recho.number(1, {min: 1, max: 4, step: 1});

const cols = 75;
const rows = 18;
const aspectRatio = cols/rows*0.5;

const frameRate = 60;
const loopFrames = Math.floor(60/animationRate);
const frameCount = recho.interval(1000/frameRate);
const progress = (frameCount) => frameCount%loopFrames/loopFrames;

//➜ ...........................................................................
//➜ ...........................................................................
//➜ ...........................................................................
//➜ ...........................................................................
//➜ ...........................................................................
//➜ ...........................................................................
//➜ ..................................00000000.................................
//➜ ................................000000000000...............................
//➜ ...............................00000000000000..............................
//➜ ...............................00000000000000..............................
//➜ ...............................00000000000000..............................
//➜ ................................000000000000...............................
//➜ ..................................00000000.................................
//➜ ...........................................................................
//➜ ...........................................................................
//➜ ...........................................................................
//➜ ...........................................................................
//➜ ...........................................................................
{
  const backgroundChar = '.';
  const foregroundChar = '0';
  const baseRadius = 0.3;
  const radiusAmplitude = 0.1;
  
  const frame = new Array(rows).fill(0).map((_,r,rowArray)=>{
    return new Array(cols).fill(0).map((_,c,colArray)=>{
      const t = progress(frameCount);
      const y = r/rowArray.length-0.5;
      const x = (c/colArray.length-0.5)*aspectRatio;
      
      const radius = Math.sqrt(x*x+y*y);
      const char = radius > baseRadius+radiusAmplitude*Math.sin(t*TAU) ?
        backgroundChar : foregroundChar;
      
      return char;
    }).join('');
  }).join('\n');
  echo(frame);
}

//➜ {---CLE}{CI----}{-IRCLE}{CIR---}{------}{------}{CIRCLE}{C-----}{CIRCLE}{--
//➜ ---}{CIRC--}{----LE}{CIRC--}{------}{------}{------}{CIRCLE}{------}{CIRC--
//➜ {-IRCLE}{------}{CIRCLE}{------}{CIRCLE}{CI----}{----LE}{CIRC--}{---CLE}{C-
//➜ -LE}{CI----}{-IRCLE}{------}{CIRCLE}{CIRCLE}{CI----}{--RCLE}{C-----}{CIRCLE
//➜ {CIRCLE}{----LE}{CIR---}{--RCLE}{CIRCLE}{CIRCLE}{------}{CIRCLE}{----LE}{CI
//➜ CLE}{C-----}{CIRCLE}{-----E}{CIRCL-}{-----E}{CIRCL-}{----LE}{CIR---}{-IRCLE
//➜ {CIRCL-}{---CLE}{C-----}{CIRCLE}{------}{---CLE}{CIR---}{-IRCLE}{-----E}{CI
//➜ CLE}{------}{CIRCL-}{---CLE}{C-----}{------}{-IRCLE}{-----E}{CIR---}{--RCLE
//➜ {CIRC--}{--RCLE}{------}{CIRC--}{---CLE}{------}{CIRC--}{--RCLE}{------}{CI
//➜ CLE}{------}{CIRC--}{--RCLE}{------}{CIRC--}{--RCLE}{------}{CIRC--}{--RCLE
//➜ {CIRC--}{--RCLE}{------}{CIRC--}{---CLE}{------}{CIRC--}{--RCLE}{------}{CI
//➜ CLE}{------}{CIRCL-}{---CLE}{C-----}{------}{-IRCLE}{-----E}{CIR---}{--RCLE
//➜ {CIRCL-}{---CLE}{C-----}{CIRCLE}{------}{---CLE}{CIR---}{-IRCLE}{-----E}{CI
//➜ CLE}{C-----}{CIRCLE}{-----E}{CIRCL-}{-----E}{CIRCL-}{----LE}{CIR---}{-IRCLE
//➜ {CIRCLE}{----LE}{CIR---}{--RCLE}{CIRCLE}{CIRCLE}{------}{CIRCLE}{----LE}{CI
//➜ -LE}{CI----}{-IRCLE}{------}{CIRCLE}{CIRCLE}{CI----}{--RCLE}{C-----}{CIRCLE
//➜ {-IRCLE}{------}{CIRCLE}{------}{CIRCLE}{CI----}{----LE}{CIRC--}{---CLE}{C-
//➜ ---}{CIRC--}{----LE}{CIRC--}{------}{------}{------}{CIRCLE}{------}{CIRC--
{
  const backgroundChars = '{------}';
  const foregroundChars = '{CIRCLE}';

  const layers = recho.number(3, {min: 1, max: 6, step: 1});
  
  const frame = new Array(rows).fill(0).map((_,r,rowArray)=>{
    
    return new Array(cols).fill(0).map((_,c,colArray)=>{

      const t = progress(frameCount);
      const y = r/rowArray.length-0.5;
      const x = (c/colArray.length-0.5)*aspectRatio;
      
      const backgroundCharOffset = r*Math.floor(backgroundChars.length/2);
      const backgroundCharIndex = (c+backgroundCharOffset)%backgroundChars.length;
      const foregroundCharOffset = r*Math.floor(foregroundChars.length/2);
      const foregroundCharIndex = (c+foregroundCharOffset)%foregroundChars.length;

      const radius = Math.sqrt(x*x+y*y);
      const char = Math.sin(radius*TAU*layers+t*TAU) > 0 ?
        backgroundChars[backgroundCharIndex] : foregroundChars[foregroundCharIndex];
      
      return char;

    }).join('');
    
  }).join('\n');
  
  echo(frame);
}

//➜ ____________/______________\//\\/___________//\\//____________\\/__________
//➜ _________\//______________//\\//\\//_____\//\\//\\_______________\_________
//➜ _______\//\\______________\\//\\//\\//_\//\\//\\//_______________/\\/______
//➜ ____\\//\\//______________//\\//\\//\__/\\//\\//\\______________\\//\\/____
//➜ __\\//\\//\\______________\\//\\//\\____//\\//\\//______________//\\//\\/__
//➜ _\//\\//\\//\______________/\\//\\//____\\//\\//\\______________\\//\\//\\/
//➜ //\\//\\//\\//_______/\\//\______/\\_____/\______/\\//_________\//\\//\\//\
//➜ \\//\\//\\//\\____//\\//\\//\___________________\\//\\//\_____//\\//\\//\\/
//➜ //\\//\\//\\//\\//\\//\\//\\//\_______________\\//\\//\\//\\_/\\//\\//\\//\
//➜ \\//\\//\\//\\/__\//\\//\\//\\//\__/\\//\___\\//\\//\\//\\/___//\\//\\//\\/
//➜ //\\//\\//\\//\_//\\//\\//\\//_______________/\\//\\//\\//\\//\\//\\//\\//\
//➜ \\//\\//\\//\\_____/\\//\\//___________________/\\//\\//\\____//\\//\\//\\/
//➜ //\\//\\//\\/_________\\//\______/\_____//\______/\\//\_______\\//\\//\\//\
//➜ _\//\\//\\//______________//\\//\\//____\\//\\//\______________/\\//\\//\\/
//➜ ___\//\\//\\______________\\//\\//\\____//\\//\\//______________//\\//\\//_
//➜ _____\//\\//______________//\\//\\//\__/\\//\\//\\______________\\//\\//___
//➜ _______\//\_______________\\//\\//\\/_\\//\\//\\//______________//\\/______
//➜ __________/_______________//\\//\\/_____\\//\\//\\______________\\/________
{
  const backgroundChars = '_';
  const foregroundChars = '//\\\\';

  const layers = recho.number(2, {min: 1, max: 6, step: 1});
  const layersAmplitude = recho.number(1, {min: 0, max: 3, step: 1});
  const waveDensity = recho.number(1, {min: 0, max: 3, step: 1});
  const waveAmplitude = recho.number(1, {min: 0, max: 2, step: 0.5});
  
  const frame = new Array(rows).fill(0).map((_,r,rowArray)=>{
    
    return new Array(cols).fill(0).map((_,c,colArray)=>{

      const t = progress(frameCount);
      const y = r/rowArray.length-0.5;
      const x = (c/colArray.length-0.5)*aspectRatio;
      
      const backgroundCharOffset = r*Math.floor(backgroundChars.length/2);
      const backgroundCharIndex = (c+backgroundCharOffset)%backgroundChars.length;
      const foregroundCharOffset = r*Math.floor(foregroundChars.length/2);
      const foregroundCharIndex = (c+foregroundCharOffset)%foregroundChars.length;

      const radius = Math.sqrt(x*x+y*y);
      const char = Math.sin(radius*TAU*layers+TAU*layersAmplitude*Math.sin(t*TAU)) >
        waveAmplitude*Math.sin(t*TAU+waveDensity*TAU*Math.atan(x/y)) ?
        backgroundChars[backgroundCharIndex] : foregroundChars[foregroundCharIndex];
      
      return char;

    }).join('');
    
  }).join('\n');
  
  echo(frame);
}
