function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;

    script.onerror = function () {
      reject(new Error('Could not load script', src));
    };

    script.onload = function () {
      resolve();
    };

    document.getElementsByTagName("head")[0].appendChild(script);
  });
}

export default loadScript('https://d3js.org/d3.v5.min.js').then(() => window.d3);
