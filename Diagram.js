function Diagram(elementId, templateId) {
    this.add = add;
    this.setMood = setMood;

    var lastId = 0;
    var currentGroup = null;
    var lastGroup = null;
    var lastX = null;
    var lastY = null;
    var mood = 'replace';
    var joinings = new Set();

    $(document.body).on('click', '[id^=svg-g-]', function(e) {
        var id = this.id.split('-')[2];
        console.log('click '+id);
        choose(id);
    });

    $(document.body).on('mousedown', '[id^=svg-g-]', function(e) {
        var id = this.id.split('-')[2];
        mousedown(id, e.clientX, e.clientY);
    });

    $(document.body).on('mouseup', '#'+elementId, function(e) {
        mouseup(e.clientX, e.clientY);
    });

    $(document.body).on('mousemove', '#'+elementId, function(e) {
        mousemove(e.clientX, e.clientY);
    });

    $(document.body).on('dragstart', '[id^=svg-g-]', function(e) {
        return false;
    });

    function add() {
        var template = $('#'+templateId)[0];
        var element = $('#'+elementId)[0];
        var el = template.cloneNode();
        el.innerHTML = template.innerHTML;
        lastId++;
        el.id = 'svg-g-'+lastId;
        element.appendChild(el);
        refresh();
    }

    function select() {
        $('#'+elementId).attr('cursor', 'move');
    }

    function choose(id) {
        console.log($('#svg-g-'+id).html());
        if(mood === 'select') {
            currentGroup = id;
        } else if(mood === 'join') {
            if(lastGroup === null) lastGroup = id;
            else join(lastGroup, id);
        }
    }

    function mousedown(id, x, y) {
        if(mood === 'replace') {
            lastGroup = id;
            lastX = x;
            lastY = y;
        }
    }

    function mouseup(x, y) {
        if(mood === 'replace') {
            if(lastX !== null) moveGroup(lastGroup, x-lastX, y-lastY);
            lastGroup = null;
            lastX = null;
            lastY = null;
        }
    }

    function mousemove(x, y) {
        if(mood === 'replace') {
            if(lastX !== null) {
                moveGroup(lastGroup, x-lastX, y-lastY);
                lastX = x;
                lastY = y;
            }
        }
    }

    function moveGroup(id, dx, dy) {
        var children = $('#svg-g-'+lastGroup).children();
        console.log('dx='+dx+' dy='+dy);
        for(var i=0; i<children.length; i++) {
            children[i].setAttribute('x', parseInt(children[i].getAttribute('x'))+dx);
            children[i].setAttribute('y', parseInt(children[i].getAttribute('y'))+dy);
        }
    }

    function join(a, b) {
        if(a !== b) joinings.add(toPair(a, b));
        joinings.forEach(function(i){
            console.log(i);
        });
        lastGroup = null;
    }

    function setMood(m) {
        mood = m;
        currentGroup = null;
        lastGroup = null;
        lastX = null;
        lastY = null;
    }

    function toPair(a, b) {
        return a<=b ? a+','+b : b+','+a;
    }

    function refresh() {
        $('body').html($('body').html());
    }
}
