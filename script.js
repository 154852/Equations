let mobile = false;
document.body.classList.add("desktop");
window.addEventListener("touchstart", () => {
    if (!mobile) {
        mobile = true;
        document.body.classList.remove("desktop");
        document.body.classList.add("mobile");
    }
});

function smoothScroll(to, millis) {
    let startS = window.scrollY;
    let startT = Date.now();
    
    let interval = setInterval(() => {
        let now = Date.now();
        if (now > startT + millis) {
            window.scrollTo(0, to);
            clearInterval(interval);
            return;
        }

        let elapsed = (now - startT) / millis;
        window.scrollTo(0, ((to - startS) * elapsed) + startS);
    }, 3);
}

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
            window.location.hash = "";
            
            vue.equations.splice(0, vue.equations.length);
            if (vue.sort.length == 0) {
                if (mobile) smoothScroll(window.innerHeight * 0.3, 300);
                return;
            }
            
            if (vue.transitioning) clearTimeout(vue.timeout);
            else vue.transitioning = true;

            Vue.nextTick().then(function() {
                vue.timeout = setTimeout(() => {
                    vue.transitioning = false;
                    vue.equations.push(...vue.sort);
                }, 200);
            });

            if (mobile) smoothScroll(0, 300);
        },
        focus: function(eqn) {
            vue.focused = eqn;
            window.location.hash = eqn.id;
            Vue.nextTick().then(function() {
                renderMathInElement(document.body);
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

    if (window.location.hash != "") vue.focus(equations[parseInt(window.location.hash.slice(1))]);

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