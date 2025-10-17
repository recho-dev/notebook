/**
 * @title CG: Text-Based Shaders
 * @created 2025-09-14
 * @author Bairui Su
 * @pull_request 98
 * @github pearmini
 * @thumbnail_start 348
 */

/**
 * ============================================================================
 * =                    Computer Graphics: Text-Based Shaders                 =
 * ============================================================================
 *
 * This tutorial introduces fundamental concepts of computer graphics through
 * text-based shader implementations in Recho.
 *
 * I'm taking Prof. Ken Perlin's Computer Graphics course this semester. In the
 * second lecture, it's fascinating to see him creating impressive visual
 * effects with GPU-based fragment shaders.
 *
 * However, I find it challenging for beginners to set up WebGL and write GLSL
 * code. Therefore, I'm creating text-based shader implementations in Recho to
 * make computer graphics more accessible to beginners.
 *
 * > You don't have to be familiar with Canvas, WebGL, or GLSL. Only basic
 * > JavaScript knowledge and some basic vector operations are required.
 *
 * After reading this, you will be able to create the following rotating sphere
 * with diffuse reflection model and ambient light!
 */

//➜
//➜             +=~~~---::::....:
//➜          *+==~~---::::..........
//➜       #**++==~~---::::.....      ..
//➜      %#*++===~~---::::.....        .
//➜    %%##*+++==~~~---::::......       ..
//➜   %%%##**++===~~----::::.......     ..:
//➜  %%%%##**+++==~~~~---:::::.............:
//➜  %%%%%##**+++===~~~----:::::...........:
//➜  %%%%%%##**+++===~~~-----::::::......:::
//➜  %%%%%%%##***++====~~~-----::::::::::::-
//➜  %%%%%%%%##***+++====~~~~-------:::::---
//➜  %%%%%%%%%###***+++====~~~~~----------~~
//➜  %%%%%%%%%%%###***++++====~~~~~~~~~~~~~=
//➜   %%%%%%%%%%%%###****++++=============+
//➜    %%%%%%%%%%%%%####****+++++++===+++*
//➜      %%%%%%%%%%%%%%####*******+++***
//➜       %%%%%%%%%%%%%%%%%############
//➜          %%%%%%%%%%%%%%%%%%%%%%%
//➜             %%%%%%%%%%%%%%%%%
//➜
echo(
  shader((vPos) => {
    const theta = uTime / 400;
    const sqrt2 = Math.sqrt(2);
    const dx = Math.cos(theta) * sqrt2;
    const dz = Math.sin(theta) * sqrt2;
    const z2 = 1 - vPos.dot(vPos);
    const skyColor = new Vector3(0.5, 0.85, 1.5);
    const ambient = new Vector3(0.2, 0.1, 0.05);
    if (z2 > 0) {
      const dir = new Vector3(dx, 1, dz);
      const p = new Vector3(vPos.x, vPos.y, Math.sqrt(z2));
      const intensity = 0.5 * Math.max(0, p.dot(dir));
      const diffuse = skyColor.clone().multiplyScalar(intensity);
      const light = diffuse.add(ambient);
      return gray2ASCII(new Vector4(light.x, light.y, light.z, 1));
    }
    return gray2ASCII(new Vector4(0, 0, 0, 0));
  }),
);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                                Shaders
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Computer graphics involves rendering pixels on the screen. Shaders are
 * programs that control how pixels are rendered. Here we focus on fragment
 * shaders, which are programs that execute once per pixel on the screen,
 * determining the color of each pixel.
 *
 * Since Recho only supports text-based output, our fragment shaders are
 * functions that execute once per cell in the output string, determining the
 * character displayed in each cell.
 *
 * Below is our implementation. The `shader` function takes a `callback`
 * function and an optional `dimension` argument, returning the output string.
 * The `callback` function is evaluated for each cell in the output string,
 * receiving the cell's position as a `Vector2` object. The callback's
 * return value determines the character displayed in that cell. For each cell,
 * the position is normalized to the range of [-1, 1] from left to right, and
 * the range of [1, -1] from top to bottom.
 */

function shader(callback, [width, height] = [41, 21]) {
  let output = "";
  for (let i = 0; i < height; i++) {
    const y = map(i, 0, height - 1, 1, -1);
    for (let j = 0; j < width; j++) {
      const x = map(j, 0, width - 1, -1, 1);
      const vPos = new Vector2(x, y);
      output += callback(vPos);
    }
    output += i === height - 1 ? "" : "\n";
  }
  return output;
}

function map(x, d0, d1, r0, r1) {
  return r0 + ((r1 - r0) * (x - d0)) / (d1 - d0);
}

/**
 * Since JavaScript doesn't support vector operations, we need to use a
 * library to help us. Here we use the vector module in Three.js. We specify
 * the version to 0.160.0, because it's the last version that can be imported
 * by Recho.
 */

const {Vector2, Vector3, Vector4} = await recho.require("three@0.160.0/build/three.min.js");

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                              Hello Circle!
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Let's draw a circle to test the shader function. The circle is defined by
 * the equation `x^2 + y^2 = 1`. For each cell, we check if the distance from
 * the cell to the center of the circle is less than or equal to 1. If it is,
 * we draw a `+` character; otherwise, we draw a space character. Here is the
 * result:
 */

//➜                     +
//➜             +++++++++++++++++
//➜         +++++++++++++++++++++++++
//➜       +++++++++++++++++++++++++++++
//➜     +++++++++++++++++++++++++++++++++
//➜    +++++++++++++++++++++++++++++++++++
//➜   +++++++++++++++++++++++++++++++++++++
//➜  +++++++++++++++++++++++++++++++++++++++
//➜  +++++++++++++++++++++++++++++++++++++++
//➜  +++++++++++++++++++++++++++++++++++++++
//➜ +++++++++++++++++++++++++++++++++++++++++
//➜  +++++++++++++++++++++++++++++++++++++++
//➜  +++++++++++++++++++++++++++++++++++++++
//➜  +++++++++++++++++++++++++++++++++++++++
//➜   +++++++++++++++++++++++++++++++++++++
//➜    +++++++++++++++++++++++++++++++++++
//➜     +++++++++++++++++++++++++++++++++
//➜       +++++++++++++++++++++++++++++
//➜         +++++++++++++++++++++++++
//➜             +++++++++++++++++
//➜                     +
echo(shader((vPos) => (vPos.length() <= 1 ? "+" : " ")));

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                          Colors to Characters
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * As mentioned above, actual fragment shaders primarily work with colors.
 * Therefore, it's better to focus on colors and convert them to characters
 * using simple rules in our text-based shader. A color is typically
 * represented by a `Vector4` object, containing the red, green, blue, and
 * alpha components. The alpha component is optional and is usually 1 for
 * opaque colors.
 *
 * Let's first implement a rule that converts the grayscale value of colors to
 * a sequence of ASCII characters.
 */

function gray2ASCII(color) {
  // If the color is transparent, return a space character.
  if (color.w !== undefined && color.w === 0) return " ";
  const chs = ["@", "%", "#", "*", "+", "=", "~", "-", ":", ".", " "];
  const gray = (color.x + color.y + color.z) / 3;
  const i = Math.floor(gray * chs.length);
  return chs[i];
}

/**
 * Then we can use the `gray2ASCII` function as shown below. This example maps
 * the x and y components of the position to the red and green components of
 * the color respectively, resulting in a gradient.
 */

//➜ ======+++++++++++***********###########%%
//➜ ========+++++++++++***********###########
//➜ ==========+++++++++++***********#########
//➜ ~===========+++++++++++***********#######
//➜ ~~~===========+++++++++++***********#####
//➜ ~~~~~===========+++++++++++***********###
//➜ ~~~~~~~===========+++++++++++***********#
//➜ ~~~~~~~~~===========+++++++++++**********
//➜ ~~~~~~~~~~~===========+++++++++++********
//➜ --~~~~~~~~~~~===========+++++++++++******
//➜ ----~~~~~~~~~~~===========+++++++++++****
//➜ ------~~~~~~~~~~~===========+++++++++++**
//➜ --------~~~~~~~~~~~===========+++++++++++
//➜ ----------~~~~~~~~~~~===========+++++++++
//➜ :-----------~~~~~~~~~~~===========+++++++
//➜ :::-----------~~~~~~~~~~~===========+++++
//➜ :::::-----------~~~~~~~~~~~===========+++
//➜ :::::::-----------~~~~~~~~~~~===========+
//➜ :::::::::-----------~~~~~~~~~~~==========
//➜ :::::::::::-----------~~~~~~~~~~~========
//➜ ..:::::::::::-----------~~~~~~~~~~~======
echo(
  shader((vPos) => {
    const rgb = new Vector3(vPos.x, vPos.y, 0).multiplyScalar(-0.5).addScalar(0.5);
    return gray2ASCII(rgb);
  }),
);

/**
 * In addition to grayscale, we can also convert the RGB components of colors
 * to a sequence of emoji color blocks.
 */

function rgb2emoji(color) {
  if (color.w !== undefined && color.w === 0) return " ";
  const normalize = (x) => x.map((d) => d / 255);
  const emojis = [
    {char: "🟥", rgb: normalize([196, 58, 38])},
    {char: "🟧", rgb: normalize([240, 144, 54])},
    {char: "🟨", rgb: normalize([234, 188, 64])},
    {char: "🟩", rgb: normalize([81, 177, 52])},
    {char: "🟦", rgb: normalize([40, 92, 233])},
    {char: "🟪", rgb: normalize([173, 66, 246])},
    {char: "⬛", rgb: normalize([3, 3, 3])},
    {char: "⬜", rgb: normalize([217, 217, 217])},
  ];
  let best = emojis[0];
  let bestDist = Infinity;
  for (const e of emojis) {
    const [r, g, b] = e.rgb;
    const {x, y, z} = color;
    const dist = (x - r) ** 2 + (y - g) ** 2 + (z - b) ** 2;
    if (dist < bestDist) {
      best = e;
      bestDist = dist;
    }
  }
  return best.char;
}

/**
 * However, the result is not optimal. Therefore, we'll use the grayscale rule
 * for the following examples.
 */

//➜ 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟦⬛⬛⬛⬛⬛⬛⬛⬛
//➜ 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟦🟦🟦🟦🟦⬛⬛⬛⬛
//➜ 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟦🟦🟦🟦🟦🟦🟦🟦🟦⬛
//➜ 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
//➜ 🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
//➜ 🟧🟧🟧🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦
//➜ 🟧🟧🟧🟧🟧🟧🟥🟥🟥🟥🟥🟥🟥🟩🟩🟩🟩🟦🟦🟦🟦🟦🟦🟦🟦
//➜ 🟧🟧🟧🟧🟧🟧🟧🟧🟧🟥🟥🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟦🟦🟦🟦
//➜ 🟧🟧🟧🟧🟧🟧🟧🟧🟧🟧🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟦
//➜ 🟧🟧🟧🟧🟧🟧🟧🟨🟨🟨🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
//➜ 🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
//➜ 🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
//➜ 🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
//➜ 🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
//➜ 🟨🟨🟨🟨🟨🟨🟨🟨🟨🟨🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
//➜ 🟨🟨🟨🟨🟨🟨🟨🟨⬜⬜⬜🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
//➜ 🟨🟨🟨🟨🟨🟨⬜⬜⬜⬜⬜🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
echo(
  shader(
    (vPos) => {
      const rgb = new Vector3(vPos.x, vPos.y, 0).multiplyScalar(-0.5).addScalar(0.5);
      return rgb2emoji(rgb);
    },
    [25, 17],
  ),
);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                              First Sphere
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Now let's draw a sphere. The sphere is defined by the equation `x^2 + y^2 +
 * z^2 = 1`. First, for each vPos (x, y), we compute the z component using
 * `1 - x^2 - y^2`, which is equivalent to `1 - vPos.dot(vPos)`. If z is
 * valid (z > 0), we compute the color of that cell; otherwise, we set the
 * color to transparent.
 *
 * We assign the z component to the red and green components of the color.
 * The larger the z value (closer to the center), the brighter the color
 * appears. This simulates a beam of light shining perpendicularly onto the
 * screen from outside.
 */

//➜
//➜             %%###*******###%%
//➜          %##****+++++++++****##%
//➜       %##**+++++=========+++++**##%
//➜      ##**+++=================+++**##
//➜    %#**+++=====~~~~~~~~~~~=====+++**#%
//➜   %#**++====~~~~~~~~~~~~~~~~~====++**#%
//➜  @#**++====~~~~~~~~~~~~~~~~~~~====++**#@
//➜  %#*++====~~~~~~---------~~~~~~====++*#%
//➜  #**++===~~~~~~-----------~~~~~~===++**#
//➜  #**++===~~~~~~-----------~~~~~~===++**#
//➜  #**++===~~~~~~-----------~~~~~~===++**#
//➜  %#*++====~~~~~~---------~~~~~~====++*#%
//➜  @#**++====~~~~~~~~~~~~~~~~~~~====++**#@
//➜   %#**++====~~~~~~~~~~~~~~~~~====++**#%
//➜    %#**+++=====~~~~~~~~~~~=====+++**#%
//➜      ##**+++=================+++**##
//➜       %##**+++++=========+++++**##%
//➜          %##****+++++++++****##%
//➜             %%###*******###%%
//➜
echo(
  shader((vPos) => {
    const z2 = 1 - vPos.dot(vPos);
    if (z2 > 0) {
      const z = Math.sqrt(z2);
      return gray2ASCII(new Vector4(z, 0, z, 1));
    }
    return gray2ASCII(new Vector4(0, 0, 0, 0));
  }),
);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                           Diffuse Reflection Model
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Next, we use the diffuse reflection model to make the sphere more realistic.
 * Given a directional light source, the intensity of light on a surface is
 * proportional to the cosine of the angle between the light direction and the
 * surface normal. For a sphere, the surface normal at point (x, y, z) is the
 * normalized vector `(x, y, z)`.
 *
 * Here we define a light direction `dir` (1, 1, 1). For each point `p`, we use
 * the dot product between `p` and `dir` to compute the light intensity.
 */

//➜
//➜             *+===~~----::::::
//➜          #*++==~~~----:::::...::
//➜       @%#**++==~~~---:::::........:
//➜      @%##**++==~~~----::::.........:
//➜    @@%%##**++===~~~---:::::.........::
//➜   @@@@%##**+++==~~~~----:::::........::
//➜  @@@@@%%##**+++==~~~~----:::::::....:::-
//➜  @@@@@%%###**+++===~~~-----::::::::::::-
//➜  @@@@@@%%###**+++===~~~~------::::::::--
//➜  @@@@@@@%%###***+++===~~~~~------------~
//➜  @@@@@@@@@%%##***++++====~~~~~~------~~~
//➜  @@@@@@@@@@%%###***++++=====~~~~~~~~~~==
//➜  @@@@@@@@@@@@%%###****+++++============+
//➜   @@@@@@@@@@@@@%%%###****+++++++++++++*
//➜    @@@@@@@@@@@@@@%%%#####************#
//➜      @@@@@@@@@@@@@@@%%%%############
//➜       @@@@@@@@@@@@@@@@@@%%%%%%%%%%@
//➜          @@@@@@@@@@@@@@@@@@@@@@@
//➜             @@@@@@@@@@@@@@@@@
//➜
echo(
  shader((vPos) => {
    const z2 = 1 - vPos.dot(vPos);
    if (z2 > 0) {
      const dir = new Vector3(1, 1, 1);
      const p = new Vector3(vPos.x, vPos.y, Math.sqrt(z2));
      const intensity = 0.5 * Math.max(0, p.dot(dir));
      return gray2ASCII(new Vector4(intensity, intensity, intensity, 1));
    }
    return gray2ASCII(new Vector4(0, 0, 0, 0));
  }),
);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                             Ambient Light
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * To make the sphere appear smoother, we can add ambient lighting to the
 * sphere. Ambient light is constant lighting that is not affected by the
 * direction of the light source.
 *
 * Here we simply add the ambient light to the diffuse light to obtain the
 * final lighting. The sphere appears brighter, and the transitions between
 * layers are more natural.
 */

//➜
//➜             +=~~~---::::....:
//➜          *+==~~---::::..........
//➜       #**++==~~---::::.....      ..
//➜      %#*++===~~---::::.....        .
//➜    %%##*+++==~~~---::::......       ..
//➜   %%%##**++===~~----::::.......     ..:
//➜  %%%%##**+++==~~~~---:::::.............:
//➜  %%%%%##**+++===~~~----:::::...........:
//➜  %%%%%%##**+++===~~~-----::::::......:::
//➜  %%%%%%%##***++====~~~-----::::::::::::-
//➜  %%%%%%%%##***+++====~~~~-------:::::---
//➜  %%%%%%%%%###***+++====~~~~~----------~~
//➜  %%%%%%%%%%%###***++++====~~~~~~~~~~~~~=
//➜   %%%%%%%%%%%%###****++++=============+
//➜    %%%%%%%%%%%%%####****+++++++===+++*
//➜      %%%%%%%%%%%%%%####*******+++***
//➜       %%%%%%%%%%%%%%%%%############
//➜          %%%%%%%%%%%%%%%%%%%%%%%
//➜             %%%%%%%%%%%%%%%%%
//➜
echo(
  shader((vPos) => {
    const z2 = 1 - vPos.dot(vPos);
    const skyColor = new Vector3(0.5, 0.85, 1.5);
    const ambient = new Vector3(0.2, 0.1, 0.05);
    if (z2 > 0) {
      const dir = new Vector3(1, 1, 1);
      const p = new Vector3(vPos.x, vPos.y, Math.sqrt(z2));
      const intensity = 0.5 * Math.max(0, p.dot(dir));
      const diffuse = skyColor.clone().multiplyScalar(intensity);
      const light = diffuse.add(ambient);
      return gray2ASCII(new Vector4(light.x, light.y, light.z, 1));
    }
    return gray2ASCII(new Vector4(0, 0, 0, 0));
  }),
);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                            Rotating Sphere
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Next, we make the sphere rotate around the y-axis. We can use the time
 * variable to compute the direction of the light. The key is to change the `x`
 * and `z` components of the light direction.
 *
 * We define a time variable `uTime` using `recho.now()`, which is a generator
 * that yields the current time continuously. Every time the time variable
 * changes, the referencing block (shader) will be re-evaluated, resulting in
 * smooth animations.
 */

const uTime = recho.now();

//➜
//➜             ####*****+++==~~-
//➜          %%%%%%%%%####***++==~~-
//➜       %%%%%%%%%%%%%%%%###**+++==~-:
//➜      %%%%%%%%%%%%%%%%%%%%##***++==~-
//➜    %%%%%%%%%%%%%%%%%%%%%%%%##***++=~~:
//➜   %%%%%%%%%%%%%%%%%%%%%%%%%%%##**++==~-
//➜  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%##**+==~-
//➜  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%##**++=~
//➜  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%##**+==
//➜  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#**+=
//➜  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%##**+
//➜  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%##*+
//➜  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#*+
//➜   %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#*
//➜    %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#
//➜      %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//➜       %%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//➜          %%%%%%%%%%%%%%%%%%%%%%%
//➜             %%%%%%%%%%%%%%%%%
//➜
echo(
  shader((vPos) => {
    const theta = uTime / 400;
    const sqrt2 = Math.sqrt(2);
    const dx = Math.cos(theta) * sqrt2;
    const dz = Math.sin(theta) * sqrt2;
    const z2 = 1 - vPos.dot(vPos);
    const skyColor = new Vector3(0.5, 0.85, 1.5);
    const ambient = new Vector3(0.2, 0.1, 0.05);
    if (z2 > 0) {
      const dir = new Vector3(dx, 1, dz);
      const p = new Vector3(vPos.x, vPos.y, Math.sqrt(z2));
      const intensity = 0.5 * Math.max(0, p.dot(dir));
      const diffuse = skyColor.clone().multiplyScalar(intensity);
      const light = diffuse.add(ambient);
      return gray2ASCII(new Vector4(light.x, light.y, light.z, 1));
    }
    return gray2ASCII(new Vector4(0, 0, 0, 0));
  }),
);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                            Moving Sphere
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Let's not only rotate the sphere, but also move it. This can be achieved by
 * updating the position and radius of the sphere.
 */

//➜
//➜
//➜
//➜
//➜
//➜
//➜
//➜
//➜
//➜
//➜
//➜                                       #***
//➜                                  %%%%%%%####***
//➜                               %%%%%%%%%%%%%###***
//➜                              %%%%%%%%%%%%%%%%###**+
//➜                             %%%%%%%%%%%%%%%%%%%###**
//➜                            %%%%%%%%%%%%%%%%%%%%%%##**
//➜                            %%%%%%%%%%%%%%%%%%%%%%%##*
//➜                            %%%%%%%%%%%%%%%%%%%%%%%%#*
//➜                            %%%%%%%%%%%%%%%%%%%%%%%%#
//➜                             %%%%%%%%%%%%%%%%%%%%%%%#
//➜                              %%%%%%%%%%%%%%%%%%%%%%
//➜                                %%%%%%%%%%%%%%%%%%
//➜                                   %%%%%%%%%%%%
//➜
//➜
//➜
//➜
//➜
//➜
//➜
echo(
  shader(
    (vPos) => {
      const now = uTime / 2000;
      const theta = uTime / 400;
      const sqrt2 = Math.sqrt(2);
      const dx = Math.cos(theta) * sqrt2;
      const dz = Math.sin(theta) * sqrt2;
      const r = 0.3 + 0.2 * Math.sin(4 * now);
      const x = vPos.x + 0.5 * Math.sin(5 * now);
      const y = vPos.y + 0.5 * Math.sin(7 * now);
      const z2 = r * r - (x * x + y * y);
      const skyColor = new Vector3(0.5, 0.85, 1.5);
      const ambient = new Vector3(0.2, 0.1, 0.05);
      if (z2 > 0) {
        const dir = new Vector3(dx, 1, dz);
        const p = new Vector3(x, y, Math.sqrt(z2));
        const intensity = 0.5 * Math.max(0, p.dot(dir));
        const diffuse = skyColor.clone().multiplyScalar(intensity);
        const light = diffuse.add(ambient);
        return gray2ASCII(new Vector4(light.x, light.y, light.z, 1));
      }
      return gray2ASCII(new Vector4(0, 0, 0, 0));
    },
    [61, 31],
  ),
);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                        More Spheres with more Lights
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * Our final example is more complex, featuring multiple spheres and multiple
 * lights. However, the concept remains the same as the previous examples.
 * The only difference is that for each cell, we need to compute the color for
 * each sphere, then select the one closest to the screen as the final color.
 */

//➜
//➜                                                   ####***++
//➜           **######                               ########***
//➜          ###########                            ############
//➜         #############                            ###########
//➜         #############                             #########
//➜         #############                                 #
//➜           #########
//➜
//➜         ####****+
//➜        ########***
//➜        ###########*
//➜        ###########
//➜         #########
//➜            ###
//➜                           %%*****+++=
//➜                          %%********+++
//➜                         %%%***********+
//➜                         %%%***********
//➜                          %%%*********
//➜                             %%%***          ##***++
//➜                                           %%###****++
//➜                                          %%#######****
//➜                                          %%##########**
//➜   *#****+++                               %###########
//➜  ######****+                               %%#######
//➜  #########***
//➜  ###########
//➜   ##########
//➜     #####
//➜
echo(
  shader(
    (vPos) => {
      const scale = 5;
      const now = uTime / 1000;
      const ambient = new Vector3(0.2, 0.1, 0.05);
      let fragColor = new Vector4(0, 0, 0, 0);
      let zMax = -1000;
      const L1 = new Vector3(Math.sin(now * 2), 1, 0).normalize();
      const L2 = new Vector3(-1, -0.1, 0).normalize();
      for (let i = 0; i < 10; i++) {
        const x = scale * vPos.x + 4 * Math.sin(11.8 * i + 100.3 + 0.3 * now);
        const y = scale * vPos.y + 4 * Math.sin(10.3 * i + 200.6 + 0.3 * now);
        const z = scale * vPos.y + 4 * Math.cos(10.3 * i + 200.6 + 0.3 * now);
        const r = 1 * 1 - (x * x + y * y);
        const z1 = z + r / (scale * scale);
        if (r > 0 && z1 > zMax) {
          zMax = z1;
          const p = new Vector3(x, y, Math.sqrt(r));
          let D1 = p.clone().dot(L1);
          let D2 = p.clone().dot(L2);
          D1 = 0.4 * Math.max(0, D1 * Math.abs(D1));
          D2 = 0.4 * Math.max(0, D1 * Math.abs(D2));
          const d1 = new Vector3(0.2, 0.5, 1).multiplyScalar(D1);
          const d2 = new Vector3(0.2, 0.5, 1).multiplyScalar(D2);
          const diffuse = d1.add(d2);
          const color = new Vector3(0.5 + 0.5 * Math.sin(i), 0.5 + 0.5 * Math.sin(4 * i), 0.5 + 0.5 * Math.sin(5 * i));
          const light = color.multiply(diffuse.add(ambient));
          return gray2ASCII(new Vector4(Math.sqrt(light.x), Math.sqrt(light.y), Math.sqrt(light.z), 1));
        }
      }
      return gray2ASCII(fragColor);
    },
    [61, 31],
  ),
);

/**
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *                               Summary
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * In this tutorial, we have learned how to use shaders to create basic
 * computer graphics effects. We have learned how to use the diffuse reflection
 * model to compute lighting, how to use ambient lighting to make the sphere
 * appear smoother, how to use the time variable to create animations, and how
 * to use multiple spheres and lights to create more complex effects.
 *
 * I hope you have enjoyed this tutorial. If you have any questions, please
 * feel free to comment on https://github.com/recho-dev/notebook/issues/98.
 */
