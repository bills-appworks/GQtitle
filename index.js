
var rendering_canvas = $('#rendering-canvas');
var rendering_canvas_context = rendering_canvas[0].getContext('2d');
var rendering_canvas_width = parseInt(rendering_canvas.css('width'));
var rendering_canvas_height = parseInt(rendering_canvas.css('height'));
// スケーリング1:1
rendering_canvas.attr('width', rendering_canvas_width);
rendering_canvas.attr('height', rendering_canvas_height);

//canvas_context.clearRect(0, 0, animation_context.rendering_canvas_width, animation_context.rendering_canvas_height);
//canvas_context.fillStyle = animation_context.bg_style;
//canvas_context.beginPath();
//canvas_context.rect(0, 0, animation_context.rendering_canvas_width, animation_context.rendering_canvas_height);
//canvas_context.fill();


rendering_canvas_context.fillStyle = 'rgb(255, 255, 255)';
rendering_canvas_context.strokeStyle = 'rgb(255, 255, 255)';

//rendering_canvas_context.beginPath();
//rendering_canvas_context.rect(0, 0, rendering_canvas_width, rendering_canvas_height);
//rendering_canvas_context.stroke();

// font-style font-variant font-weight font-size font-family
//rendering_canvas_context.font = 'normal normal 600 128pt "Shippori Antique"';
//rendering_canvas_context.font = 'italic 600 128pt sans-serif';
//rendering_canvas_context.fillText('予告', 200, 200);

//rendering_canvas_context.font = 'normal normal 600 128pt "BIZ UDPGothic"';
//rendering_canvas_context.font = 'italic 600 128pt sans-serif';
//rendering_canvas_context.fillText('ガンダム', 200, 400);

function drawText(ctx, x, y, text) {
  ctx.fillText(text, x, y);
}

function getValues(ctx, text, spacing) {
  var text_metrics = ctx.measureText(text);
  var text_length = text.length;
  var padding_horizontal = text_metrics.width / text_length / 3;
  var text_height = text_metrics.actualBoundingBoxAscent + text_metrics.actualBoundingBoxDescent;
  var padding_vertical = text_height / 5;
  var text_base_x = padding_horizontal;
  var text_base_y = padding_vertical + text_height;
  return {
    "text_width": parseInt(text_metrics.width),
    "text_height": parseInt(text_height),
    "padding_horizontal": parseInt(padding_horizontal),
    "padding_vertical": parseInt(padding_vertical),
    "area_width": parseInt(text_metrics.width + padding_horizontal * 3 - spacing * 10),
    "area_height": parseInt(text_height + padding_vertical * 3),
    "text_base_x": parseInt(text_base_x),
    "text_base_y": parseInt(text_base_y)
  };
}

function setStyle(ctx) {
  ctx.fillStyle = 'rgb(255 255 255)';
  ctx.strokeStyle = 'rgb(255 255 255)';
}

function setFont(ctx, size) {
  ctx.font = 'italic 600 ' + size + 'pt sans-serif';
}

function setLetterSpacing(ctx, spacing) {
  var actual_spacing = spacing * 0.05;
  ctx.letterSpacing = actual_spacing + 'em';
}

function adjustCanvas(canvas, ctx, width, height) {
//  canvas.width = width;
//  canvas.height = height;
//  canvas[0].width = width;
//  canvas[0].height = height;
  canvas[0].style.width = width + 'px';
  canvas[0].style.height = height + 'px';
  canvas.attr('width', width);
  canvas.attr('height', height);
//  ctx.fillStyle = 'rgb(255, 255, 255)'
//  ctx.strokeStyle = 'rgb(255, 255, 255)'
}

function drawFrame(canvas, ctx) {
  ctx.strokeStyle = 'rgb(255, 255, 255)';
  ctx.beginPath();
  ctx.rect(0, 0, canvas[0].width, canvas[0].height);
  ctx.stroke();
}

function drawBackground(canvas, ctx) {
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.beginPath();
  ctx.rect(0, 0, canvas[0].width, canvas[0].height);
  ctx.fill();
}

function drawTexture(canvas, ctx) {
  var image = new Image();
  image.addEventListener("load", () => {
    ctx.drawImage(image, 0, 0);

    var image_data = ctx.getImageData(0, 0, canvas[0].width, canvas[0].height);

    var rendering2_canvas = $('#rendering2-canvas');
    var rendering2_canvas_context = rendering2_canvas[0].getContext('2d');
    adjustCanvas(rendering2_canvas, rendering2_canvas_context, canvas[0].width, canvas[0].height);
    rendering2_canvas_context.putImageData(image_data, 0, 0); 
  });
  image.src = './texture.png';
}

function rendering(canvas, ctx) {
  var text = $('#subtitle-text').val();
  var size = $('#subtitle-size').val();
  var spacing = $('#subtitle-spacing').val();
  var brightness = $('#subtitle-brightness').val();

  setLetterSpacing(ctx, spacing);
  setFont(ctx, size);
  var values = getValues(ctx, text, spacing);
  adjustCanvas(canvas, ctx, values.area_width, values.area_height);

  drawBackground(canvas, ctx);
//  drawFrame(canvas, ctx);

  setStyle(ctx);
  setFont(ctx, size);
  setLetterSpacing(ctx, spacing);

  drawText(ctx, values.text_base_x, values.text_base_y, text);
  drawTexture(canvas, ctx);

//  ctx.fillStyle = 'rgb(0 0 0 / 90%)';
//  ctx.beginPath();
//  ctx.rect(0, 0, 200, 200);
//  ctx.fill();
}

rendering(rendering_canvas, rendering_canvas_context);

$('#subtitle-text').on('input', () => {
  rendering(rendering_canvas, rendering_canvas_context);
});

$('#subtitle-size').on('input', () => {
  rendering(rendering_canvas, rendering_canvas_context);
});

$('#subtitle-spacing').on('input', () => {
  rendering(rendering_canvas, rendering_canvas_context);
});

$('#subtitle-brightness').on('input', () => {
  rendering(rendering_canvas, rendering_canvas_context);
});

//drawText(rendering_canvas_context, 0, 20, $('#subtitle-text').val());
