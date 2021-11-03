app.component('associates', {
    template:
        /*html*/
        `<div class="orders">  
          <h3>Our Sales Associates</h3>
          <hr>         
          <div :set="count=0">
             <div v-for="associate in list">
                <div class="associates" :set="count++">
                    <div>{{ associate.id }} - {{associate.name}}</div>
                    <div>commission \${{ associate.commission.toFixed(2) }}</div>
                    <div>
                        <button @click="edit(associate)">Edit</button>  &nbsp;             
                        <button @click="remove(associate)">Delete</button> 
                    </div>              
                </div>                          
             </div>
             <hr>
             <h4>{{ count }} associates found</h4>
          </div>
          <edit-modal v-if="showModal" :associate="associate" @close="closeModal()"></edit-modal>
          <form class="newbracket" autocomplete="off">
            <!-- fake fields are a workaround for chrome autofill getting the wrong fields -->
            <input style="display: none" type="text" name="fakeusernameremembered" />                    
            <label>Name:</label>&nbsp;<input v-model="aName" autocomplete="off" />&nbsp;
            <input style="display: none" type="password" name="fakepasswordremembered" />
            <label>Password:</label>&nbsp;<input type="password" v-model="aPwd" autocomplete="off" />&nbsp;
            <button v-on:click="newAssociate()">Add new associate</button>
          </form>
         </div>`,
    data() {
        return {
            associates: null,
            aName: '',
            aPwd: '',
            aAddress: '',
            associate: null,
            showModal: false
        }
    },
    methods: {
        async getAssociates() {
            var resp = await axios.get('http://localhost:3001/getAssociates')
            // console.log(resp.data);
            this.associates = resp.data
        },
        async newAssociate() {
            if (this.aName === ''    || this.aPwd === '') {
                alert('Please fill in name and password.')
                return
            }
            this.associate = {name: this.aName, address: this.aAddress, password: this.aPwd};
            var resp = await axios.post('http://localhost:3001/createAssociate', this.associate)
            console.log(resp.data);
            this.aName = ''
            this.aAddress = ''
            this.aPwd = ''
            this.getAssociates()
        },
        edit(associate) {
            this.associate = associate;
            this.showModal = true
        },
        async remove(associate) {
            this.associate = {id: associate.id};
            var resp = await axios.post('http://localhost:3001/deleteAssociate', this.associate)
            console.log(resp.data);
            this.getAssociates()
        },
        closeModal() {
            this.getAssociates()
            this.showModal = false
        }
    },
    computed: {
        list() {
            if (this.associates == null) {
                this.getAssociates()
            }          
            return this.associates
        }
    }
})