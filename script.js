let fuse, equations;
const vue = new Vue({
    el: "#app",
    data: {
        equations: [],
        input: "",
        focused: null
    },
    methods: {
        search: function() {
            let search = fuse.search(vue.input);;
            let toRemove = vue.equations.filter((x) => search.find((y) => y.id == x.id) == null);
            let toAdd = search.filter((x) => vue.equations.find((y) => y.id == x.id) == null);
            toAdd.forEach((x) => vue.equations.splice(0, 0, x));
            toRemove.forEach((eqn) => {
                vue.equations.splice(vue.equations.findIndex((x) => x.id == eqn.id), 1);
            });
            vue.focused = null;
        },
        focus: function(eqn) {
            vue.focused = eqn;
            Vue.nextTick().then(function() {
                renderMathInElement(document.body);
            });
        }
    }
});

axios.get("./equations.json").then((response) => {
    equations = response.data.equations;
    equations.forEach((equation, id) => {
        equation.latex = katex.renderToString(equation.latex, {
            output: "html",
            displayMode: true,
            throwOnError: false
        });
        equation.id = id;
    });

    fuse = new Fuse(equations, {
        keys: [{
            name: "name",
            weight: 0.1
        }, {
            name: "tags",
            weight: 0.9
        }],
        threshold: 0.1
    });
});