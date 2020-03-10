let fuse, equations;
const vue = new Vue({
    "el": "#app",
    data: {
        equations: [],
        input: "",
        focused: null
    },
    methods: {
        search: function() {
            vue.focused = null;
            vue.equations = fuse.search(vue.input);
        },
        focus: function(eqn) {
            vue.focused = eqn;
            Vue.nextTick().then(function () {
                renderMathInElement(document.body);
            });
        }
    }
});

axios.get("/equations.json").then((response) => {
    equations = response.data.equations;
    equations.forEach((equation) => {
        equation.latex = katex.renderToString(equation.latex, {
            output: "html",
            displayMode: true,
            throwOnError: false
        });
    });

    fuse = new Fuse(equations, {
        keys: [{
            name: "name",
            weight: 0.7
        }, {
            name: "tags",
            weight: 0.3
        }]
    });
});