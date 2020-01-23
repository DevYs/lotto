ready(function() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://wearecyw.iptime.org:8082/animal/post');
    xhr.send();

    xhr.addEventListener('load', function(e) {
        console.log(xhr.response);
        console.log(xhr.responseText);
    });

    xhr.addEventListener('success', function(e) {
        console.log(xhr.response);
        console.log(xhr.responseText);
    });

    xhr.addEventListener('error', function(e) {
        console.log(e);
    });

});

function ready(fn) {
    if (document.readyState != 'loading'){
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}
