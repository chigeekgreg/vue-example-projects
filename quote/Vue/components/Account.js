app.component('account', {
    template:
        /*html*/
        `<div class="account">                       
            <h3>Please login:</h3>                        
            <div class="modal-body edit-list">
                <label>Name:</label> <input v-model="name">
                <label>Password:</label> <input type="password" v-model="pwd"> 
            </div>
            <div class=error>{{ error }}</div>
            <button @click="login">Login</button>                    
         </div>`,
    data() {
        return {
            name: '',
            pwd: '',
            error: ''
        }
    },
    methods: {
        async login() {
            var response = await axios.get(`http://localhost:3001/getAssociates?name=${this.name}`)
            if (response.data.length) {
                var associate = response.data[0]
                // console.log(this.pwd, associate.password)
                if (this.pwd === associate.password) {
                    this.$emit('done', associate) 
                    return
                } 
            }
            this.error = "user name/password do not match"
        }
    }
})