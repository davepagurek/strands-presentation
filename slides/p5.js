class P5Sketch {
  constructor(slide, node) {
    this.slide = slide;
    this.node = node;
    const lines = node.querySelector('script').innerHTML.split('\n');
    while (lines.length && /^\s*$/.exec(lines[0])) {
      lines.shift();
    }
    while (lines.length && /^\s*$/.exec(lines.at(-1))) {
      lines.pop();
    }
    this.code = lines.join('\n');
    node.innerHTML = '';

    this.webgpu = node.getAttribute('webgpu');
    this.version = node.getAttribute('version');
    this.cdnBase = /\d+\.\d+\.\d+/.exec(this.version)
      ? `https://cdn.jsdelivr.net/npm/p5@${this.version}/lib`
      : `https://raw.esm.sh/pr/p5@${this.version}/lib`;
    this.targetWidth = parseFloat(node.getAttribute('width'));
    this.targetHeight = parseFloat(node.getAttribute('height'));
    this.library = node.getAttribute('library');
    this.showCode = node.getAttribute('showCode');

    if (this.showCode) {
      const code = document.createElement('code');
      const spaces = /^\s*/.exec(this.code)[0].length;
      console.log(spaces);
      const highlightedCode = hljs.highlight(
        this.code.split('\n').map(l => l.slice(spaces)).join('\n'),
        { language: 'javascript' }
      ).value
      code.innerHTML = highlightedCode;
      code.classList.add('code');
      this.node.appendChild(code);
    }

    this.iframe = document.createElement('iframe');
    this.iframe.setAttribute('width', this.targetWidth);
    this.iframe.setAttribute('height', this.targetHeight);
    this.iframe.setAttribute('border', 0);
    this.iframe.classList.add('p5Sketch');
    this.iframe.addEventListener('load', () => this.update(this.slide.order));
    this.node.appendChild(this.iframe);
  }

  update(order) {
    this.iframe.contentWindow?.postMessage({ order }, '*');
  }

  show() {
    this.iframe.srcdoc = `
<!DOCTYPE html>
<meta charset="utf8" />
<style type='text/css'>
html, body {
  margin: 0;
  padding: 0;
}
canvas {
  display: block;
}
</style>
<script type="text/javascript" src="${this.cdnBase}/p5.min.js"></script>
${this.webgpu ? `<script type="text/javascript" src="${this.cdnBase}/p5.webgpu.min.js"></script>` : ''}
${this.library ? `<script type="text/javascript" src="${this.library}"></script>` : ''}
<body>
<script id="code" type="text/javascript">
window.order = 0;
window.addEventListener('message', (event) => {
  if (event.data?.order !== undefined) {
    window.order = event.data.order;
  }
});
${this.code}
</script>
</body>`;
  }

  hide() {
    this.iframe.srcdoc = '';
  }
}
