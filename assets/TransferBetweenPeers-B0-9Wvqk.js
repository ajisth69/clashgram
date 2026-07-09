import{Ag as e,Bn as t,Br as n,Cg as r,Da as i,Dg as a,Eo as o,Er as s,Ft as c,Gn as l,Hg as u,I as d,Lg as f,Mg as p,Ni as m,Pg as h,Rf as g,Si as _,Tg as v,Tn as y,Ul as b,Wn as x,X as S,Xf as C,Zf as w,_g as ee,bn as te,ca as T,dg as ne,h as re,ht as E,jg as ie,jo as ae,kg as oe,kr as se,oa as ce,pn as le,qf as ue,ug as D,vg as O,vn as k,vt as A,wn as de,xg as fe,yg as j}from"./shared-components-BsF1L_Nx.js";import{b as pe}from"./ClashgramBadge-BMuEPE4T.js";import{n as me}from"./usePrevious-CH-Za79v.js";import{n as he}from"./animatedAssets-CUW74yt0.js";import{B as ge,_t as _e,ct as ve,dt as ye,ht as be}from"./ActionMessage-BdJqnpYK.js";var M={root:`Kdv89j1l`,top:`_0EdTY2mJ`,badge:`TvB5YSlK`,text:`lZY9nXge`},xe=v(({peer:e,avatarWebPhoto:t,avatarSize:n,text:r,badgeText:i,badgeIcon:a,className:o,badgeClassName:s,badgeIconClassName:c,textClassName:l,onClick:u})=>{let d=le();return j(`div`,{className:w(M.root,u&&M.clickable,o),onClick:u,children:[j(`div`,{className:M.top,children:[O(E,{size:n,peer:e,webPhoto:t}),i&&j(`div`,{className:w(M.badge,s),dir:d.isRtl?`rtl`:`ltr`,children:[a&&O(C,{name:a,className:c}),i]})]}),r&&O(`p`,{className:w(M.text,l),children:r})]})}),Se={blue:[0,152/255,234/255],blueGradient:[[1/255,88/255,175/255],[103/255,208/255,255/255]],purple:[150/255,111/255,254/255],purpleGradient:[[107/255,147/255,255/255],[228/255,106/255,206/255]],gold:[255/255,191/255,10/255],goldGradient:[[253/255,235/255,50/255],[215/255,89/255,2/255]]},Ce={particleCount:5,distanceLimit:1,fadeInTime:.05,minLifetime:3,maxLifetime:3,maxStartTimeDelay:0,selfDestroyTime:3,minSpawnRadius:5,maxSpawnRadius:50},N={width:350,height:230,particleCount:100,color:[0,152/255,234/255],speed:18,baseSize:6,minSpawnRadius:35,maxSpawnRadius:70,distanceLimit:.7,fadeInTime:.25,fadeOutTime:1,minLifetime:4,maxLifetime:6,maxStartTimeDelay:3,edgeFadeZone:50,centerShift:[0,0],accelerationFactor:3,selfDestroyTime:0},we=.67,Te=1.33,Ee=2.2,P=new Map;function De(e,t){let n=P.get(e);return n||(n=Oe(e),P.set(e,n)),n.addSystem(t)}function Oe(e){let t=e.getContext(`webgl`,{alpha:!0,antialias:!1,preserveDrawingBuffer:!1});if(!t)throw Error(`WebGL not supported`);let n=F(t,t.VERTEX_SHADER,ke),r=F(t,t.FRAGMENT_SHADER,Ae);if(!n||!r)throw Error(`Failed to create shaders`);let i=je(t,n,r);if(!i)throw Error(`Failed to create shader program`);let a=window.devicePixelRatio||1,o=new Map,s={attributes:{startPosition:t.getAttribLocation(i,`a_startPosition`),velocity:t.getAttribLocation(i,`a_velocity`),startTime:t.getAttribLocation(i,`a_startTime`),lifetime:t.getAttribLocation(i,`a_lifetime`),size:t.getAttribLocation(i,`a_size`),baseOpacity:t.getAttribLocation(i,`a_baseOpacity`),color:t.getAttribLocation(i,`a_color`)},uniforms:{resolution:t.getUniformLocation(i,`u_resolution`),time:t.getUniformLocation(i,`u_time`),canvasWidth:t.getUniformLocation(i,`u_canvasWidth`),canvasHeight:t.getUniformLocation(i,`u_canvasHeight`),accelerationFactor:t.getUniformLocation(i,`u_accelerationFactor`),fadeInTime:t.getUniformLocation(i,`u_fadeInTime`),fadeOutTime:t.getUniformLocation(i,`u_fadeOutTime`),edgeFadeZone:t.getUniformLocation(i,`u_edgeFadeZone`),rotationMatrices:t.getUniformLocation(i,`u_rotationMatrices`),spawnCenter:t.getUniformLocation(i,`u_spawnCenter`)}},c,l;function u(e){let n=new Me(e.seed),{config:r}=e,i=new Float32Array(r.particleCount*2),o=new Float32Array(r.particleCount*2),s=new Float32Array(r.particleCount),c=new Float32Array(r.particleCount),l=new Float32Array(r.particleCount),u=new Float32Array(r.particleCount),d=new Float32Array(r.particleCount*3);for(let t=0;t<r.particleCount;t++){let f=n.next()*Math.PI*2,p=n.nextBetween(r.minSpawnRadius,r.maxSpawnRadius),m=Math.cos(f),h=Math.sin(f),g=e.centerX+m*p,_=e.centerY+h*p;i[t*2]=g*a,i[t*2+1]=_*a,c[t]=n.nextBetween(r.minLifetime,r.maxLifetime),s[t]=n.next()*r.maxStartTimeDelay;let v=n.nextBetween(e.avgDistance*r.distanceLimit*.5,e.avgDistance*r.distanceLimit)/c[t]*a;o[t*2]=m*v,o[t*2+1]=h*v;let y=n.next();y<.3?l[t]=r.baseSize*we*a:y<.7?l[t]=r.baseSize*Te*a:l[t]=r.baseSize*Ee*a,u[t]=n.nextBetween(.3,.8);let b=Pe(r.color,n);d[t*3]=b[0],d[t*3+1]=b[1],d[t*3+2]=b[2]}t.bindBuffer(t.ARRAY_BUFFER,e.buffers.startPosition),t.bufferData(t.ARRAY_BUFFER,i,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.velocity),t.bufferData(t.ARRAY_BUFFER,o,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.startTime),t.bufferData(t.ARRAY_BUFFER,s,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.lifetime),t.bufferData(t.ARRAY_BUFFER,c,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.size),t.bufferData(t.ARRAY_BUFFER,l,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.baseOpacity),t.bufferData(t.ARRAY_BUFFER,u,t.STATIC_DRAW),t.bindBuffer(t.ARRAY_BUFFER,e.buffers.color),t.bufferData(t.ARRAY_BUFFER,d,t.STATIC_DRAW)}function d(){let n=0,r=0;o.forEach(e=>{n=Math.max(n,e.config.width),r=Math.max(r,e.config.height)}),o.size===0&&(n=N.width,r=N.height),(e.width!==n*a||e.height!==r*a)&&(e.width=n*a,e.height=r*a,e.style.width=n+`px`,e.style.height=r+`px`),t.viewport(0,0,e.width,e.height)}function f(){t.useProgram(i),t.uniform2f(s.uniforms.resolution,e.width,e.height),t.uniformMatrix2fv(s.uniforms.rotationMatrices,!1,Ne()),t.enable(t.BLEND),t.blendFunc(t.ONE,t.ONE_MINUS_SRC_ALPHA),t.clearColor(0,0,0,0)}function p(e){c&&=(t.clear(t.COLOR_BUFFER_BIT),o.forEach(n=>{let r=(e-n.startTime)/1e3;t.uniform1f(s.uniforms.time,r),t.uniform1f(s.uniforms.canvasWidth,n.config.width*a),t.uniform1f(s.uniforms.canvasHeight,n.config.height*a),t.uniform1f(s.uniforms.accelerationFactor,n.config.accelerationFactor),t.uniform1f(s.uniforms.fadeInTime,n.config.fadeInTime),t.uniform1f(s.uniforms.fadeOutTime,n.config.fadeOutTime),t.uniform1f(s.uniforms.edgeFadeZone,n.config.edgeFadeZone*a),t.uniform2f(s.uniforms.spawnCenter,n.centerX*a,n.centerY*a),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.startPosition),t.enableVertexAttribArray(s.attributes.startPosition),t.vertexAttribPointer(s.attributes.startPosition,2,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.velocity),t.enableVertexAttribArray(s.attributes.velocity),t.vertexAttribPointer(s.attributes.velocity,2,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.startTime),t.enableVertexAttribArray(s.attributes.startTime),t.vertexAttribPointer(s.attributes.startTime,1,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.lifetime),t.enableVertexAttribArray(s.attributes.lifetime),t.vertexAttribPointer(s.attributes.lifetime,1,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.size),t.enableVertexAttribArray(s.attributes.size),t.vertexAttribPointer(s.attributes.size,1,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.baseOpacity),t.enableVertexAttribArray(s.attributes.baseOpacity),t.vertexAttribPointer(s.attributes.baseOpacity,1,t.FLOAT,!1,0,0),t.bindBuffer(t.ARRAY_BUFFER,n.buffers.color),t.enableVertexAttribArray(s.attributes.color),t.vertexAttribPointer(s.attributes.color,3,t.FLOAT,!1,0,0),t.drawArrays(t.POINTS,0,n.config.particleCount)}),requestAnimationFrame(p))}function m(e){let n=fe(),r={...N,...e},i={id:n,config:r,buffers:{startPosition:t.createBuffer(),velocity:t.createBuffer(),startTime:t.createBuffer(),lifetime:t.createBuffer(),size:t.createBuffer(),baseOpacity:t.createBuffer(),color:t.createBuffer()},startTime:performance.now(),seed:Math.floor(Math.random()*1e6),centerX:r.width/2+r.centerShift[0],centerY:r.height/2+r.centerShift[1],avgDistance:(r.width/2+r.height/2)/2};return o.set(n,i),u(i),d(),r.selfDestroyTime&&(i.selfDestroyTimeout=window.setTimeout(()=>{h(n)},r.selfDestroyTime*1e3)),o.size===1&&(f(),l=y.subscribe(()=>{let e=!y();e&&!c?c=requestAnimationFrame(p):!e&&c&&(cancelAnimationFrame(c),c=void 0)}),c=requestAnimationFrame(p)),()=>h(n)}function h(e){let n=o.get(e);n&&(n.selfDestroyTimeout&&clearTimeout(n.selfDestroyTimeout),Object.values(n.buffers).forEach(e=>{e&&t.deleteBuffer(e)}),o.delete(e),o.size===0&&g())}function g(){c!==void 0&&(cancelAnimationFrame(c),c=void 0),l?.(),o.clear(),t.deleteProgram(i),t.deleteShader(n),t.deleteShader(r),P.delete(e)}return{addSystem:m}}var ke=`
    attribute vec2 a_startPosition;
    attribute vec2 a_velocity;
    attribute float a_startTime;
    attribute float a_lifetime;
    attribute float a_size;
    attribute float a_baseOpacity;
    attribute vec3 a_color;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_canvasWidth;
    uniform float u_canvasHeight;
    uniform float u_accelerationFactor;
    uniform float u_fadeInTime;
    uniform float u_fadeOutTime;
    uniform float u_edgeFadeZone;
    uniform mat2 u_rotationMatrices[18];
    uniform vec2 u_spawnCenter;

    varying float v_opacity;
    varying vec3 v_color;

    void main() {
        float totalAge = u_time - a_startTime;
        float age = mod(totalAge, a_lifetime);

        // For the initial animation, fade in all particles
        float globalFadeIn = min(u_time / u_fadeInTime, 1.0);

        float lifeRatio = age / a_lifetime;

        // Calculate rotation based on completed lifecycles
        float lifecycleCount = floor(totalAge / a_lifetime);
        int rotationIndex = int(mod(lifecycleCount, 18.0));

        // Get rotation matrix
        mat2 rotationMatrix = u_rotationMatrices[rotationIndex];

        // Rotate start position around spawn center
        vec2 startOffset = a_startPosition - u_spawnCenter;
        vec2 rotatedStartOffset = rotationMatrix * startOffset;
        vec2 rotatedStartPosition = u_spawnCenter + rotatedStartOffset;

        // Apply rotation matrix to velocity
        vec2 rotatedVelocity = rotationMatrix * a_velocity;

        // Apply shoot-out effect: fast initial speed that slows down
        float speedMultiplier = 1.0 + u_accelerationFactor * exp(-3.0 * lifeRatio);

        vec2 position = rotatedStartPosition + rotatedVelocity * age * speedMultiplier;

        float opacity = 1.0;
        if (lifeRatio < u_fadeInTime / a_lifetime) {
            opacity = (lifeRatio * a_lifetime) / u_fadeInTime;
        } else if (lifeRatio > 1.0 - u_fadeOutTime / a_lifetime) {
            opacity = (1.0 - lifeRatio) * a_lifetime / u_fadeOutTime;
        }
        opacity *= a_baseOpacity * globalFadeIn;

        float distToLeft = position.x;
        float distToRight = u_canvasWidth - position.x;
        float distToTop = position.y;
        float distToBottom = u_canvasHeight - position.y;
        float distToEdge = min(min(distToLeft, distToRight), min(distToTop, distToBottom));

        if (distToEdge < u_edgeFadeZone) {
            opacity *= distToEdge / u_edgeFadeZone;
        }

        vec2 clipSpace = ((position / u_resolution) * 2.0 - 1.0) * vec2(1, -1);
        gl_Position = vec4(clipSpace, 0, 1);
        gl_PointSize = a_size;
        v_opacity = opacity;
        v_color = a_color;
    }
`,Ae=`
    precision mediump float;

    varying float v_opacity;
    varying vec3 v_color;

    void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);

        // Create a four-pointed star
        float absX = abs(coord.x);
        float absY = abs(coord.y);

        // Star parameters
        float innerSize = 0.12;    // Size of center square
        float armLength = 0.45;    // Length of star arms
        float armWidth = 0.08;     // Half-width of star arms at base

        float dist = 1.0; // Default to outside

        // Center square
        if (absX <= innerSize && absY <= innerSize) {
            dist = max(absX, absY) - innerSize;
        }
        // Horizontal arms (left and right points)
        else if (absY <= armWidth && absX <= armLength) {
            // Taper the arms - they get narrower toward the tips
            float normalizedX = (absX - innerSize) / (armLength - innerSize);
            float taperFactor = 1.0 - normalizedX * 0.8; // Taper to 20% of original width
            float currentArmWidth = armWidth * taperFactor;
            dist = absY - currentArmWidth;
        }
        // Vertical arms (top and bottom points)
        else if (absX <= armWidth && absY <= armLength) {
            // Taper the arms - they get narrower toward the tips
            float normalizedY = (absY - innerSize) / (armLength - innerSize);
            float taperFactor = 1.0 - normalizedY * 0.8; // Taper to 20% of original width
            float currentArmWidth = armWidth * taperFactor;
            dist = absX - currentArmWidth;
        }

        // Use smoothstep for anti-aliasing to reduce subpixel artifacts
        float alpha = 1.0 - smoothstep(-0.01, 0.01, dist);

        if (alpha <= 0.0) {
            discard;
        }

        gl_FragColor = vec4(v_color * v_opacity * alpha, v_opacity * alpha);
    }
`;function F(e,t,n){let r=e.createShader(t);if(r){if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){e.deleteShader(r);return}return r}}function je(e,t,n){let r=e.createProgram();if(r){if(e.attachShader(r,t),e.attachShader(r,n),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS)){e.deleteProgram(r);return}return r}}var Me=class{seed;constructor(e){this.seed=e}next(){return this.seed=(this.seed*9301+49297)%233280,this.seed/233280}nextBetween(e,t){return e+(t-e)*this.next()}},I;function Ne(){if(!I){I=new Float32Array(72);for(let e=0;e<18;e++){let t=220*Math.PI/180*e,n=Math.cos(t),r=Math.sin(t);I[e*4]=n,I[e*4+1]=r,I[e*4+2]=-r,I[e*4+3]=n}}return I}function Pe(e,t){if(Array.isArray(e[0])){let[n,r]=e;return[t.nextBetween(n[0],r[0]),t.nextBetween(n[1],r[1]),t.nextBetween(n[2],r[2])]}return e}var Fe={sparkles:`JxY8hVTW`},Ie={centerShift:[0,-36]},Le=8,L=v(({color:t=`purple`,centerShift:n=Ie.centerShift,isDisabled:r,className:i,onRequestAnimation:a})=>{let o=p(),s=p(0);return e(()=>{if(!r)return De(o.current,{color:Se[`${t}Gradient`],centerShift:n})},[n,t,r]),oe(()=>{a&&a(()=>{if(r)return;let e=Date.now();e-s.current<Le||(s.current=e,De(o.current,{color:Se[`${t}Gradient`],centerShift:n,...Ce}))})},[n,t,r,a]),O(`canvas`,{ref:o,className:w(Fe.sparkles,i)})}),R={root:`CHDf16MJ`,diamond:`UM7C8oRj`},Re=``+new URL(`diamond-57JalFxA.png`,import.meta.url).href,z=5,B=1,ze=300,Be=1500,V,H=!0;function Ve({className:e,onMouseMove:t}){let[n,r]=h(B),i=T(()=>{V&&=(clearTimeout(V),void 0),V=window.setTimeout(()=>{let e=Date.now();H=!0,c(()=>{if(!H)return!1;let t=Math.min((Date.now()-e)/Be,1),n=(z-B)*(1-Ue(t));return r(n),H=t<1&&n>1,H},u)},ze),H=!1,r(z),t()});return O(`div`,{className:w(R.root,e),children:O(`div`,{className:R.diamond,onMouseMove:i,children:O(me,{speed:n,size:130,tgsUrl:he.Diamond,previewUrl:Re,nonInteractive:!0,noLoop:!1})})})}var He=v(Ve);function Ue(e){return 1-(1-e)**2}var U={root:`QcfrGLdX`,star:`nDPg-zs5`,star_purple:`-f2S1Tk6`,starPurple:`-f2S1Tk6`},W=50;function We({className:e,color:t,centerShift:n,onMouseMove:r}){let i=p(),a=T(e=>{let t=e.currentTarget.getBoundingClientRect(),a=t.left+t.width/2+n[0],o=t.top+t.height/2+n[1],s=e.clientX-a,c=e.clientY-o,l=Math.max(-1,Math.min(1,s/W)),d=Math.max(-1,Math.min(1,c/W)),f=l*40,p=-d*40;u(()=>{i.current.style.transform=`scale(1.1) rotateX(${p}deg) rotateY(${f}deg)`}),r()}),o=T(()=>{u(()=>{i.current.style.transform=``})});return O(`div`,{className:w(U.root,e),onMouseMove:a,onMouseLeave:o,children:O(`div`,{ref:i,className:w(U.star,U[`star_${t}`]),role:`img`,"aria-label":`Clashgram Stars`})})}var Ge=v(We),G={root:`cK6KQXnQ`,"ai-egg":`ZP86O9Hy`,aiEgg:`ZP86O9Hy`,title:`xRm-Im3m`,description:`IQdQ9MU9`,particles:`_8ooQ3s8b`,stickerWrapper:`hHs2sTV-`,cocoon:`Rlhm9gZk`},Ke=``+new URL(`cocoon-DzgJltGQ.webp`,import.meta.url).href,K=8*n,q={centerShift:[0,-36]};function qe({model:e,sticker:t,color:n,title:r,description:i,isDisabled:a,className:o,modelClassName:s}){let c=p(),l=p(),u=T(()=>{l.current?.()}),d=T(e=>{l.current=e});return j(`div`,{className:w(G.root,G[e],o),children:[O(L,{color:n,centerShift:q.centerShift,isDisabled:a,className:G.particles,onRequestAnimation:d}),e===`swaying-star`?O(Ge,{className:s,color:n,centerShift:q.centerShift,onMouseMove:u}):e===`ai-egg`?O(`img`,{src:Ke,alt:``,role:`presentation`,"aria-hidden":`true`,className:w(G.cocoon,s),draggable:!1,onMouseMove:u}):e===`speeding-diamond`?O(He,{className:s,onMouseMove:u}):e===`sticker`&&t&&O(`div`,{ref:c,className:w(G.stickerWrapper,s),style:`width: ${K}px; height: ${K}px`,onMouseMove:u,children:O(te,{containerRef:c,sticker:t,size:K,shouldPreloadPreview:!0,shouldLoop:!0})}),O(`h2`,{className:G.title,children:r}),O(`div`,{className:G.description,children:i})]})}var Je=v(qe),J={root:`_7NV36hp3`,wrapper:`_32sWnI-2`,down:`DkDmNeYG`,frame:`M0hUT4cv`,video:`eWi57MWV`,placeholder:`A38HRiXg`},Ye=``+new URL(`DeviceFrame-Dqm_t18H.svg`,import.meta.url).href,Xe=v(({videoId:e,videoThumbnail:n,isActive:r,isReverseAnimation:i,isDown:a,index:o,className:s,wrapperClassName:c})=>{let l=t(e?`document${e}`:void 0),u=ye(n?.dataUri),d=pe(l);return O(`div`,{className:w(J.root,s),children:j(`div`,{className:w(J.wrapper,i&&J.reverse,a&&J.down,c),id:o===void 0?void 0:`premium_feature_preview_video_${o}`,children:[O(`img`,{src:Ye,alt:``,className:J.frame,draggable:!1}),!e&&O(`div`,{className:J.placeholder}),n&&O(`canvas`,{ref:u,className:J.video}),e&&O(de,{canPlay:!!r,className:w(J.video,d),src:l,disablePictureInPicture:!0,playsInline:!0,muted:!0,loop:!0})]})})}),Y={options:`Upert7zo`,option:`_2X6-9ciP`,active:`zpGahRpW`,wideOption:`dI8-J8yI`,optionTop:`wgA5YkCl`,stackedStars:`TZ71sXrE`,stackedStar:`_6CGkOJue`,optionBottom:`GRPtw1Lm`,moreOptions:`cY6CHTaj`,iconDown:`qdRs-uv4`},Ze=6,Qe=v(({isActive:e,className:t,options:n,selectedStarOption:r,selectedStarCount:i,starsNeeded:a,onClick:o})=>{let s=k(),c=le(),[u,d,f]=l();oe(()=>{e||f()},[e]);let[p,m]=ie(()=>{if(!n)return[void 0,!1];let e=n.reduce((e,t)=>e.stars>t.stars?e:t),t=a&&e.stars<a,r=[],i=0,o=!1;return n.forEach((e,s)=>{if(e.isExtended||i++,!(a&&!t&&e.stars<a)){if(!u&&e.isExtended){o=!0;return}r.push({option:e,starsCount:Math.min(i,Ze),isWide:s===n.length-1})}}),[r,o]},[u,n,a]);return j(`div`,{className:w(Y.options,t),children:[p?.map(({option:e,starsCount:t,isWide:n})=>{let a=p?.length%2==0,l=e===r,u;return e&&`winners`in e&&(u=(e.winners.find(e=>e.users===i)||e.winners.reduce((e,t)=>t.users>e.users?t:e,e.winners[0]))?.perUserStars),j(`div`,{className:w(Y.option,!a&&n&&Y.wideOption,l&&Y.active),onClick:()=>o?.(e),children:[j(`div`,{className:Y.optionTop,children:[`+`,_(e.stars),O(`div`,{className:Y.stackedStars,dir:c.isRtl?`ltr`:`rtl`,children:Array.from({length:t}).map(()=>O(ue,{className:Y.stackedStar,type:`gold`,size:`big`}))})]}),O(`div`,{className:Y.optionBottom,children:g(c,e.amount,e.currency)}),(l||r&&`winners`in r)&&!!u&&O(`div`,{className:Y.optionBottom,children:O(`div`,{className:Y.perUserStars,children:ce(s(`BoostGift.Stars.PerUser`,_(u)))})})]},e.stars)}),!u&&m&&j(A,{className:Y.moreOptions,isText:!0,noForcedUpperCase:!0,onClick:d,children:[s(`Stars.Purchase.ShowMore`),O(C,{className:Y.iconDown,name:`down`})]})]})}),X={content:`j63Xdo6p`,fixedHeight:`E-xx83T0`,withSearch:`sT1YPCzK`,header:`RwB3BKcO`,buttonWrapper:`Z-xvJZEk`},$e=`.${be.pickerList}`,et=v(({confirmButtonText:e,isConfirmDisabled:t,shouldAdaptToSearch:n,withFixedHeight:r,onConfirm:i,withPremiumGradient:a,itemsContainerSelector:o=$e,...s})=>{let c=k(),l=!!(e||i),u=p();return ge({containerRef:u,selector:`.modal-content ${o}`,isBottomNotch:l,shouldHideTopNotch:!0},[s.isOpen]),j(S,{...s,dialogRef:u,isSlim:!0,className:w(n&&X.withSearch,r&&X.fixedHeight,s.className),contentClassName:w(X.content,s.contentClassName),headerClassName:w(X.header,s.headerClassName),isCondensedHeader:!0,children:[s.children,l&&O(`div`,{className:X.buttonWrapper,children:O(A,{withPremiumGradient:a,onClick:i||s.onClose,color:`primary`,disabled:t,children:e||c(`Confirm`)})})]})}),Z={table:`RMEi5Sgb`,cell:`AEl8NMjg`,title:`IypKoG1m`,value:`ZO-KCUSl`,fullWidth:`_1WIqSuNB`,chatItem:`J6it2-iy`},tt=v(({tableData:e,className:t,onChatClick:n})=>{let{openChat:r}=D(),i=T(e=>{n?n(e):r({id:e})});if(e?.length)return O(`div`,{className:w(Z.table,t),children:e.map(([e,t])=>j(ee,{children:[!!e&&O(`div`,{className:w(Z.cell,Z.title),children:e}),O(`div`,{className:w(Z.cell,Z.value,!e&&Z.fullWidth),children:typeof t==`object`&&`chatId`in t?O(_e,{peerId:t.chatId,className:Z.chatItem,forceShowSelf:!0,withEmojiStatus:t.withEmojiStatus,clickArg:t.chatId,onClick:i}):t})]}))})}),Q={content:`rIjOLQyf`,noFooter:`ssGgYoZw`,avatar:`IdvEatvm`},nt=v(({isOpen:e,title:t,tableData:n,headerAvatarPeer:r,header:i,modalHeader:a,footer:o,buttonText:s,className:c,contentClassName:l,tableClassName:u,hasBackdrop:d,closeButtonColor:f,moreMenuItems:p,headerRightToolBar:m,onClose:h,onButtonClick:g,withBalanceBar:_,isLowStackPriority:v,currencyInBalanceBar:y})=>{let{openChat:b}=D(),x=T(e=>{b({id:e}),h()});return j(S,{isOpen:e,hasCloseButton:!!t,hasAbsoluteCloseButton:!t,absoluteCloseButtonColor:f||(d?`translucent-white`:void 0),isSlim:!0,header:a,title:t,className:c,contentClassName:w(Q.content,l),moreMenuItems:p,headerRightToolBar:m,onClose:h,withBalanceBar:_,currencyInBalanceBar:y,isLowStackPriority:v,children:[r&&O(E,{peer:r,size:`jumbo`,className:Q.avatar}),i,O(tt,{tableData:n,className:u,onChatClick:x}),o,s&&O(A,{className:o?void 0:Q.noFooter,onClick:g||h,children:s})]})}),$={root:`FEEwg5rl`,secondary:`_51eeI1vd`,topIcon:`_0fVPMdEi`,premiumGradient:`oEaPoig5`,content:`_7xJ2IMc7`,listItems:`_4Smlf3-h`,listItemTitle:`lPVHA-w3`,separator:`V6iMhrLh`},rt=v(({className:e,isOpen:t,listItemData:n,headerIconName:r,headerIconPremiumGradient:i,header:a,footer:o,buttonText:s,hasBackdrop:c,absoluteCloseButtonColor:l,withSeparator:u,contentClassName:f,onClose:p,onButtonClick:m})=>j(S,{isOpen:t,className:w($.root,e),contentClassName:w($.content,f),hasAbsoluteCloseButton:!0,absoluteCloseButtonColor:l||(c?`translucent-white`:void 0),onClose:p,children:[r&&O(`div`,{className:w($.topIcon,i&&$.premiumGradient),children:O(C,{name:r})}),a,O(`div`,{className:$.listItems,children:n?.map(([e,t,n])=>j(d,{isStatic:!0,multiline:!0,icon:e,className:$.listItem,children:[O(`span`,{className:w(`title`,$.listItemTitle),children:t}),O(`span`,{className:`subtitle`,children:n})]}))}),u&&O(re,{className:$.separator}),o,!!s&&O(A,{onClick:m||p,children:s})]}));function it(e,t,n){let[r,i]=h(),{isFrozen:a,updateWhenUnfrozen:o}=at(),c=ve(t,!0);return s(()=>{if(a){o();return}c(()=>{i(e())})},[...n,a]),r}function at(){let e=p(!1),t=a(()=>{e.current=!0},[]),n=r();return x(ot,a(()=>{e.current&&(e.current=!1,n())},[n])),{isFrozen:f(),updateWhenUnfrozen:t}}function ot(){}var st=300;async function ct(e){let t=await i(`searchChats`,{query:e});if(t)return[...t.accountResultIds,...t.globalResultIds]}function lt(e){return async t=>{let n=t.trim();if(o(e)){let t=b(ne(),e.id)?.members?.map(e=>e.userId)||[];return n?m({ids:t,query:n,type:`user`}):t}let r=(await i(`fetchMembers`,{chat:e,memberFilter:n?`search`:`recent`,query:n}))?.members?.map(e=>e.userId)||[];if(!ae(e))return r;if(!n)return[...r,e.id];let a=m({ids:[e.id],query:n,type:`chat`});return[...r,...a]}}function ut({query:e,queryFn:t=ct,defaultValue:n,debounceTimeout:r=st,isDisabled:i}){let a=it(()=>e,r,[e]),[o,s]=h(``),c=e&&a,l=T(t);return{...se(async()=>{if(!c||i)return s(``),Promise.resolve(n);let e=await l(c);return s(c),e},[c,n,l,i],n),currentResultsQuery:o}}var dt={root:`JaXKxj2K`,arrow:`_-7ow-ETi`},ft=4*n,pt=v(({fromPeer:e,toPeer:t,avatarSize:n=ft})=>j(`div`,{className:dt.root,children:[O(E,{peer:e,size:n}),O(C,{name:`next`,className:dt.arrow}),O(E,{peer:t,size:n})]}));export{nt as a,Qe as c,L as d,xe as f,rt as i,Xe as l,lt as n,tt as o,ut as r,et as s,pt as t,Je as u};
//# sourceMappingURL=TransferBetweenPeers-B0-9Wvqk.js.map