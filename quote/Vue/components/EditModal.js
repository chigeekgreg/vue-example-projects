app.component('edit-modal', {
    template:
        /*html*/
        `<transition name="modal">
          <div class="modal-mask">
            <div class="modal-wrapper">
              <div class="modal-container"> 
                <div class="modal-header">                 
                  <button class="modal-default-button" @click="$emit('close')">&#x2715;</button>
                  <h3>Edit Associte: {{ associate.id }}</h3>
                </div>
                <div class="modal-body edit-list">
                  <label>Name:</label> <input v-model="name">
                  <label>Address:</label> <input v-model="address">
                  <label>New password:</label> <input type="password" v-model="pwd">  
                  <label>Commission:</label> <input v-model="commission">  
                </div>
                <div class="modal-footer">
                  &nbsp;
                  <button class="modal-default-button" @click="update()">Update</button>
                </div>
              </div>
            </div>
        </div>
      </transition>`,
    props: {
        associate: {
            type: Object,
            required: true
        }
    },
    data() {
      return {
          name: this.associate.name,
          pwd: '',
          address: this.associate.address,
          commission: this.associate.commission
      }
  },
  methods: {
    async update() {
      console.log(this.name,this.pwd,this.commission)
      if (this.name === '' || this.address === '' || this.commission === '') {
        alert('Please fill in all fields.')
        return
      }
      var comm = parseFloat(this.commission);
      if (isNaN(comm)) {
          alert('Commission must be anumber.')
          return
      }
      this.associate.name = this.name;
      this.associate.address = this.address;
      if (this.pwd !== '') {
        this.associate.password = this.pwd
      }
      this.associate.commission = comm
      var resp = await axios.post('http://localhost:3001/updateAssociate', this.associate)
      console.log(resp.data);
      this.$emit('close')
    }

  }
})