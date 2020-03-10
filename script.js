let fuse, equations;
const vue = new Vue({
    el: "#app",
    data: {
        equations: [],
        input: "",
        focused: null,
        transitioning: false,
        sort: [],
        timeout: null
    },
    methods: {
        search: function() {
            vue.focused = null;
            vue.sort = fuse.search(vue.input);
            
            vue.equations.splice(0, vue.equations.length);
            if (vue.sort.length == 0) return;
            
            if (vue.transitioning) clearTimeout(vue.timeout);
            else vue.transitioning = true;

            Vue.nextTick().then(function() {
                vue.timeout = setTimeout(() => {
                    vue.transitioning = false;
                    vue.equations.push(...vue.sort);
                }, 200);
            });
        },
        focus: function(eqn) {
            document.body.classList.add("hide");
            vue.focused = eqn;
            Vue.nextTick().then(function() {
                renderMathInElement(document.body);
                document.body.classList.remove("hide");
            });
        }
    },
    computed: {
        listOpen: function() {
            return (this.equations.length != 0 || this.transitioning) && this.focused == null;
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
        equation.tags.push("all");
    });

    fuse = new Fuse(equations, {
        keys: [{
            name: "name",
            weight: 0.1
        }, {
            name: "tags",
            weight: 0.9
        }],
        threshold: 0.1,
        shouldSort: true,
        minMatchCharLength: 2
    });
});