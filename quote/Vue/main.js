const app = Vue.createApp({
    data() {
        return {
            loggedIn: null,
            content: "list",
        }
    },
    methods: {
        login(associate) {
            // console.log('login: ', associate)
            this.loggedIn = associate
        }
    }
}); 