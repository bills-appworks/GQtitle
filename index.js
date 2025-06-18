/**
 * @fileoverview GQuuuuuuXサブタイトル風画像ジェネレータ
 * @author bills-appworks https://bsky.app/profile/did:plc:lfjssqqi6somnb7vhup2jm5w
 * @copyright bills-appworks 2025
 * @license This software is released under the MIT License. http://opensource.org/licenses/mit-license.php
*/
'use strict';

var rendering_canvas = $('#rendering-canvas');
var rendering_canvas_context = rendering_canvas[0].getContext('2d');
var rendering_canvas_width = parseInt(rendering_canvas.css('width'));
var rendering_canvas_height = parseInt(rendering_canvas.css('height'));
var display_canvas = $('#display-canvas');
var display_canvas_context = display_canvas[0].getContext('2d');

rendering_canvas_context.fillStyle = 'rgb(255, 255, 255)';
rendering_canvas_context.strokeStyle = 'rgb(255, 255, 255)';

const adjust_characters = '$\/()|{}[]_';

function drawAdjustText(ctx, x, y, text) {
  let offset_x = 0;
  const text_metrics = ctx.measureText(adjust_characters); 
  const adjust_offset_y = (text_metrics.actualBoundingBoxAscent + text_metrics.actualBoundingBoxDescent) / 100 * -5;
  text.split('').forEach((character) => {
    let offset_y = adjust_characters.includes(character) ? adjust_offset_y : 0;
    ctx.fillText(character, x + offset_x, y + offset_y);
    offset_x += ctx.measureText(character).width;
  });
}

function drawText(ctx, x, y, text) {
  if (adjust_characters.split('').some((character) => text.includes(character))) {
    drawAdjustText(ctx, x, y, text);
  } else {
    ctx.fillText(text, x, y);
  }
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
  canvas[0].style.width = width + 'px';
  canvas[0].style.height = height + 'px';
  canvas.attr('width', width);
  canvas.attr('height', height);
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

function drawTextureAndDisplay(brightness) {
  var image = new Image();
  image.addEventListener("load", () => {
    // 画像ロード完了後の処理（テクスチャ画像描画・キャンバス間反映）

    // レンダリング用キャンバスに描画（輝度パラメタ以外）してから表示用キャンバスに反映（輝度反映）
    // CanvasRenderingContext2D.getImageData()/putImageData()による方法も考えられるが
    // fill/stroke描画対象とimage描画対象を合わせて透過（輝度）表現するのにglobalAlpha/createPattern()による処理が適当であるため
    // 良い副作用としてローカル実行時にgetImageData()では抵触するCORS制約が回避される

    // テクスチャ画像をレンダリング用キャンバスに描画
    rendering_canvas_context.drawImage(image, 0, 0);

    // 表示用キャンバスのサイズをレンダリング用キャンバスに合わせる
    adjustCanvas(display_canvas, display_canvas_context, rendering_canvas[0].width, rendering_canvas[0].height);
    // 輝度パラメタを透過率として表現
    // 文字描画時とテクスチャ画像描画時に輝度を処理する方法もあるが
    // テクスチャ画像描画時だと白黒描画ピクセルも処理（黒抜けさせたいところも灰色化）してしまうため
    // 文字とテクスチャをレンダリング用キャンバスで合成してから表示用キャンバス反映時に一括して処理
    display_canvas_context.globalAlpha = brightness / 100;
    display_canvas_context.fillStyle = display_canvas_context.createPattern(rendering_canvas[0], 'no-repeat');
    display_canvas_context.beginPath();
    display_canvas_context.rect(0, 0, display_canvas[0].width, display_canvas[0].height);
    display_canvas_context.fill();
    display_canvas_context.closePath();
  });
  image.src = './texture.png';
}

function buildUrl() {
  var url = location.href.split('?')[0];
  var params = {};
  if (query_parameter.text) {
    params.text = query_parameter.text;
  }
  if (query_parameter.size) {
    params.size = query_parameter.size;
  }
  if (query_parameter.spacing) {
    params.spacing = query_parameter.spacing;
  }
  if (query_parameter.brightness) {
    params.brightness = query_parameter.brightness;
  }
  var params_expand = new URLSearchParams(params).toString();
  if (query_parameter._specified) {
    return url + '?' + params_expand;
  } else {
    return url;
  }
}

function displayReplayUrl() {
  $('#replay-url').val(buildUrl());
}

function replaceBrowserUrl() {
  var url = buildUrl();
  history.replaceState(query_parameter, '', url);
  // 本アプリではhistory.pushState()による履歴操作は行わない
}

function rendering(canvas, ctx) {
  // 指定パラメタ取得
  var text = $('#subtitle-text').val();
  var size = $('#subtitle-size').val();
  var spacing = $('#subtitle-spacing').val();
  var brightness = $('#subtitle-brightness').val();

  // 各種数値算出用にフォントサイズ・文字間隔を適用
  setFont(ctx, size);
  setLetterSpacing(ctx, spacing);
  // 描画用各種数値を算出
  var values = getValues(ctx, text, spacing);
  // キャンバスサイズを表示内容に合わせて調整
  adjustCanvas(canvas, ctx, values.area_width, values.area_height);
  // 背景描画（初期化）
  drawBackground(canvas, ctx);
// 描画範囲の参考用枠表示
//  drawFrame(canvas, ctx);

  // adjustCanvas後は各種設定がクリアされるため再設定
  // 塗りつぶし／ストロークスタイル・フォントサイズ・文字間隔設定
  setStyle(ctx);
  setFont(ctx, size);
  setLetterSpacing(ctx, spacing);

  // タイトルテキスト描画
  drawText(ctx, values.text_base_x, values.text_base_y, text);
  // テクスチャ画像描画および表示用キャンバスへの反映
  drawTextureAndDisplay(brightness);
  // 再現URL欄の設定
  displayReplayUrl();
  // ブラウザURLの設定
  replaceBrowserUrl();
}

function parseQueryParameter() {
  var param_object = {};
  var query_parameter = location.search;
  if (query_parameter && query_parameter.length > 1) {
    param_object["_specified"] = true;
    var url_search_params = new URLSearchParams(query_parameter);
    ["text", "size", "spacing", "brightness"].map((element) => {
        param_object[element] = url_search_params.get(element);
    });
  } else {
    param_object["_specified"] = false;
  }
  return param_object;
}

/*
 * UIイベントハンドラ
 */

$('#subtitle-text').on('input', () => {
  query_parameter.text = $('#subtitle-text').val();
  query_parameter._specified = true;
  rendering(rendering_canvas, rendering_canvas_context);
});

$('#subtitle-size').on('input', () => {
  query_parameter.size = $('#subtitle-size').val();
  query_parameter._specified = true;
  $('#subtitle-size-number').val($('#subtitle-size').val());
  rendering(rendering_canvas, rendering_canvas_context);
});

$('#subtitle-size-number').on('input', () => {
  query_parameter.size = $('#subtitle-size-number').val();
  query_parameter._specified = true;
  $('#subtitle-size').val($('#subtitle-size-number').val());
  rendering(rendering_canvas, rendering_canvas_context);
});

$('#subtitle-spacing').on('input', () => {
  query_parameter.spacing = $('#subtitle-spacing').val();
  query_parameter._specified = true;
  $('#subtitle-spacing-number').val($('#subtitle-spacing').val());
  rendering(rendering_canvas, rendering_canvas_context);
});

$('#subtitle-spacing-number').on('input', () => {
  query_parameter.spacing = $('#subtitle-spacing-number').val();
  query_parameter._specified = true;
  $('#subtitle-spacing').val($('#subtitle-spacing-number').val());
  rendering(rendering_canvas, rendering_canvas_context);
});

$('#subtitle-brightness').on('input', () => {
  query_parameter.brightness = $('#subtitle-brightness').val();
  query_parameter._specified = true;
  $('#subtitle-brightness-number').val($('#subtitle-brightness').val());
  rendering(rendering_canvas, rendering_canvas_context);
});

$('#subtitle-brightness-number').on('input', () => {
  query_parameter.brightness = $('#subtitle-brightness-number').val();
  query_parameter._specified = true;
  $('#subtitle-brightness').val($('#subtitle-brightness-number').val());
  rendering(rendering_canvas, rendering_canvas_context);
});

$('#download').on('click', () => {
  var link = document.createElement("a");
  var display_canvas = $('#display-canvas');
  link.href = display_canvas[0].toDataURL("image/png");
  link.download = "GQuuuuuuX-subtitle.png";
  link.click();
});

$('#copy-replay-url').on('click', () => {
  navigator.clipboard.writeText($('#replay-url').val());
  $('#copied-balloon').addClass('copied-balloon-fadeout');
  setTimeout(() => {
    $('#copied-balloon').removeClass('copied-balloon-fadeout');
  }, 3000);
});

/*
 * エントリポイント
 */
// URLクエリパラメタ取得・反映
var query_parameter = parseQueryParameter();
if (query_parameter.text) {
  $('#subtitle-text').val(decodeURIComponent(query_parameter.text.substring(0, 256)));
}
if (query_parameter.size) {
  $('#subtitle-size').val(query_parameter.size);
  $('#subtitle-size-number').val(query_parameter.size);
}
if (query_parameter.spacing) {
  $('#subtitle-spacing').val(query_parameter.spacing);
  $('#subtitle-spacing-number').val(query_parameter.spacing);
}
if (query_parameter.brightness) {
  $('#subtitle-brightness').val(query_parameter.brightness);
  $('#subtitle-brightness-number').val(query_parameter.brightness);
}
// 初回実行時レンダリング
rendering(rendering_canvas, rendering_canvas_context);
