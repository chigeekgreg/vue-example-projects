app.component('quote-modal', {
    template:
        /*html*/
        `<transition name="modal">
          <div class="modal-mask">
            <div class="modal-wrapper">
              <div class="modal-container"> 
                <div class="modal-header">                 
                  <button class="modal-default-button" @click="$emit('close')">&#x2715;</button>
                  <h3 v-if="isQuote">Quote for: {{ quote.customer.name }}</h3>
                  <h3 v-else>Order from: {{ quote.customer.name }}</h3>
                  {{ quote.customer.street }}<br>
                  {{ quote.customer.city }}<br>
                  {{ quote.customer.contact }}
                  <div v-if="!isQuote">
                    Fullfilled on: {{ quote.status }}<br>
                    Commission: {{ quote.commission }} </div>
                </div>
                <div class="modal-body">
                  Email: <input type="email" v-model="email" :disabled="mode!=='open'">              
                  <h4>Line Items: <button class="header-button" @click="newItem()" :disabled="mode=='process'||mode=='all'">new item</button></h4>
                  <div v-for="item in quote.items" v-bind:key="item.id">
                    <line-item :item="item" :mode="mode" @update="updateItem" @remove="removeItem"></line-item>
                  </div>
                  <h4>Secret Notes: <button class="header-button" @click="newNote()" :disabled="mode=='process'||mode=='all'">new note</button></h4>
                  <div v-for="note in quote.notes" v-bind:key="note.id">
                    <secret-note :note="note" :mode="mode" @update="updateNote" @remove="removeNote"></secret-note>
                  </div>
                  <br>
                  <div v-if="mode!=='all'">
                    Discount: <input v-model="discount"> <button @click="applyDiscount()">Apply</button>
                    <input type="radio" value="percent" v-model="discountType"><label for="percent">percent</label>
                    <input type="radio" value="dollar" v-model="discountType"><label for="dollar">amount</label>
                    <br>
                  </div>
                  Amount: \${{quote.amount.toFixed(2)}}<br>
                </div> 
                <div class="modal-footer" v-if="mode!=='all'">
                &nbsp;
                <button v-if="quote.id" class="modal-default-button" @click="update()">Update</button>
                <button v-else class="modal-default-button" @click="update()">Create</button>
                <hr>
                <div v-if="mode=='open'" class="finalize">
                  To finalize this quote and submit it to processing in headquaters, click here:
                  <button @click="finalize()">Finalize Quote</button>
                </div>
                <div v-if="mode=='final'" class="finalize">
                  To sanction this quote and email it to the customer, click here:
                  <button @click="sanction()">Sanction Quote</button>
                </div>
                <div v-if="mode=='process'" class="finalize">
                  To convert this quote into an order and process it, click here:
                  <button @click="process()">Process PO</button>
                </div>
              </div>                                                    
              </div>
            </div>
        </div>
      </transition>`,
    props: {
        quote: {
            type: Object,
            required: true
        },
        mode: {
            type: String,
            default: 'open'
        }
    },
    data() {
      return {
          email: this.quote.email,
          discount: 0,
          discountType: 'percent'
      }
    },
    methods: {
      newItem() {
        this.quote.items.push({text: '', price: 0, status: true})
      },
      newNote() {
        this.quote.notes.push({text: '', status: true})
      },
      removeItem(item) {
        // console.log('remove:', item)
        // console.log(this.quote.items)       
        var oldItems = this.quote.items
        this.quote.items = []
        for (var it of oldItems) {
          if (it !== item) {
            this.quote.items.push(it)             
          } else {
            this.quote.amount -= item.price
          }
        }
      },
      removeNote(note) {
        // console.log('remove:', note)
        var oldNotes = this.quote.notes
        this.quote.notes = []
        for (var no of oldNotes) {
          if (no !== note) {
            this.quote.notes.push(no)
          }
        }
      },
      applyDiscount() {
        var discount = parseFloat(this.discount)
            if (isNaN(discount)) {
                alert('Discount must be a number')
                return
            }
        if (this.discountType === 'percent') {
          this.quote.amount *= ((100 - discount) /100)         
        } else {
          this.quote.amount = Math.max(0, this.quote.amount - discount)
        }
        this.discount = 0
      },
      checkQuote() {
        // console.log(this.quote)
        if (this.email === '') {
          alert('Please fill in email field.')
          return  false
        }
        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email))) {
          alert("You have entered an invalid email address!")
          return false
        }
        this.quote.email = this.email
        for (item of this.quote.items) {
          // console.log(item)
          if (item.status) {
            alert('Please accept all changes to line items')
            return  false
          }
        }
        for (note of this.quote.notes) {
          // console.log(note)
          if (note.status) {
            alert('Please accept all changes to secret notes')
            return  false
          }
        }
        return true
      },
      async update() {
        if (!this.checkQuote()) {
          return
        }        
        if (this.quote.id) {
          var resp = await axios.post('http://localhost:3001/updateQuote', this.quote)
        } else {
          var resp = await axios.post('http://localhost:3001/createQuote', this.quote)
        }
        if (this.mode=='final') {
          alert(`Quote has been emailed to ${this.quote.email}`)
        }
        this.$emit('close')
      },
      finalize() {
        this.quote.status='finalized'
        this.update()
      },
      sanction() {             
        this.quote.status='sanctioned'
        this.update()
      },
      async process() {
        NProgress.start()
        // call process PO 
        var data = {
          'order': this.quote.id + '-' + (Math.random()*1000).toFixed(0),
          'associate': this.quote.associateid,
          'custid': this.quote.custid,
          'amount': this.quote.amount
        };
        // console.log(data);
        var response = await axios.post('http://blitz.cs.niu.edu/purchaseorder', data);
        // console.log(response)
        NProgress.inc()
        this.quote.status = response.data.processDay
        var resp = await axios.get(`http://localhost:3001/getAssociates?id=${this.quote.associateid}`)
        // console.log(resp)
        NProgress.inc()
        var associate = resp.data[0]
        var commRate = parseInt(response.data.commission)
        this.quote.commission = this.quote.amount * (commRate/100)
        // console.log('Commission: ', this.quote.commission)
        associate.commission += this.quote.commission 
        resp = await axios.post('http://localhost:3001/updateAssociate', associate)
        // console.log(resp)
        NProgress.inc()
        this.update()
        alert(`PO has been processed for ${this.quote.status}.\nCommission of ${this.quote.commission} has been credited to ${associate.name}.`)
        NProgress.done()
      },
      updateItem(item) {
        // console.log(item)
        if (item.text === '') {
          alert('Please fill in text field.')
          return
        }
        var pri = parseFloat(item.price)
        if (isNaN(pri)) {
            alert('Price must be a number')
            return
        } 
        this.quote.amount = 0
        for (var it of this.quote.items) {
          if (it == item) {
            // console.log('found item')
            it.text = item.text
            it.price = pri
          }
          this.quote.amount += it.price
        }
      },
      updateNote(note) {
        // console.log(note)
        if (note.text === '') {
          alert('Please fill in text field.')
          return
        }
        for (var no of this.quote.notes) {
          if (no == note) {
            // console.log('found note')
            no.text = note.text
          }
        }
      } 
    },
    computed: {
      isQuote() {
        return (new Set(['open', 'final', 'sanctioned']).has(this.quote.status))
      }
    }
})