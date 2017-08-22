window.app = (function () {

  function init () {
    $('button#run').click(function () {
      console.log("run!!!");
    });
  }

  return {
    init: init
  };
})();

window.app.init();
