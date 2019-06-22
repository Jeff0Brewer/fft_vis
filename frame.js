var VSHADER_SOURCE =
	"attribute vec2 a_Position;\n" +

	"uniform mat4 u_ModelMatrix;\n" +
	"uniform mat4 u_ViewMatrix;\n" +
	"uniform mat4 u_ProjMatrix;\n" +
	"uniform vec4 u_Color;\n" +

	"varying vec3 v_Position;\n" +
	"varying vec4 v_Color;\n" +

	"void main() {\n" +
		"gl_Position = u_ProjMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position[0], a_Position[1], 0, 1);\n" +
		"v_Color = u_Color;\n" +
	"}\n";

var FSHADER_SOURCE =
"precision highp float;\n" +
"varying vec4 v_Color;\n" +

"void main() { \n" +
	"gl_FragColor = v_Color;\n" +
"}";

var p_fpv = 2;

modelMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();

var fovy = 40;

var g_last = Date.now();

function main() {
	view = new CameraController([0, 0, 10], [0, 0, 0], [0,1,0], .5, .05);
	let h = 10*Math.tan(fovy*Math.PI/180/2);
	let w = h*window.innerWidth/window.innerHeight;


	canvas = document.getElementById("canvas");
	canvas.width = innerWidth;
	canvas.height = innerHeight;

	setup_gl();
	vis = new Vis(p_fpv, 20, analyser.fftSize/2*.7);
	vis.init_buffers();

	projMatrix.setPerspective(fovy, canvas.width / canvas.height, 1, 10000);
	gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	viewMatrix.setLookAt(view.camera.x, view.camera.y, view.camera.z, view.focus.x, view.focus.y, view.focus.z, view.up.x, view.up.y, view.up.z);
	gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

	var tick = function() {
		let now = Date.now();
		let elapsed = now - g_last;
		g_last = now;

		analyser.getByteFrequencyData(fData);

		if(audio.currentTime >= audio.duration)
			nextsong(false);

		vis.update(fData);
		draw();

		requestAnimationFrame(tick, canvas);
	};
	tick();
}
main();

function draw() {
	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

	vis.draw(u_ModelMatrix);
}

function setup_gl(){
	gl = getWebGLContext(canvas);
	gl.enableVertexAttribArray(0);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.disable(gl.DEPTH_TEST);
	gl.clearColor(0,0,0,0);

	initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);

	u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
	u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
	u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");
}

document.body.onresize = function(){
	canvas.width = innerWidth;
	canvas.height = innerHeight;

	let h = 10*Math.tan(fovy*Math.PI/180/2);
	let w = h*window.innerWidth/window.innerHeight;
	vis.h = h;
	vis.w = w;

	if(gl){
		projMatrix.setPerspective(fovy, canvas.width / canvas.height, 1, 500);
		gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		draw();
	}
}
