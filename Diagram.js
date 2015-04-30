function Diagram(elementId, templateId) {
    this.add = add;
    this.select = select;
    this.choose = choose;
    this.mousedown = mousedown;

    var currentGroup;
    var lastGroup;
    var lastId = 0;

    $(document.body).on('click', '[id^=svg-g-]', function(e) {
        var id = this.id.split('-')[2];
        console.log('click '+id);
        choose(id);
    });

    function add() {
        var template = $('#'+templateId)[0];
        var element = $('#'+elementId)[0];
        var el = template.cloneNode();
        el.innerHTML = template.innerHTML;
        lastId++;
        el.id = 'svg-g-'+lastId;
        console.log('id='+lastId);
        element.appendChild(el);
        refresh();
    }

    function select() {
        element.attr('cursor', 'pointer');
    }

    function choose(id) {
        console.log($('#svg-g-'+id).html());
        currentGroup = id;
    }

    function mousedown(e) {
        console.log(' x='+e.clientX+' y='+e.clientY);
    }

    function refresh() {
        $('body').html($('body').html());
    }
}
