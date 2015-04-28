function Diagram(id) {
    this.id = id;
    this.add = add;
    var element = $('#'+id);

    function add() {
        element.append('<rect xmlns="http://www.w3.org/2000/svg" width="200" height="100"></rect>');
        refresh()
    }

    function refresh() {
        $('body').html($('body').html());
    }
}
