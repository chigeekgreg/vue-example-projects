app.component('quotes-start', {
    template:
        /*html*/
        `<div class="quotes">  
          <div class="newquote">
            <h3>Create new quote for Customer:</h3>
            Select customer: <select v-model="customer">
                <option disabled value="">Please select one</option>
                <option v-for="cust in customers" :value="cust">{{ cust.name }}</option>
            </select>
            &nbsp; <button @click="createQuote(customer)" :disabled="customer===''">New Quote</button>
            <br>
            {{ cCount }} current customers
          </div>
          <hr>
          <h3 v-if="qCount">List of current quotes:</h3>
          <div v-else>No open quotes</div>
           <div v-for="quote in quotes" class="quotegrid quote">           
                {{ quote.id }}:&nbsp;{{ findCustomer(quote).name }}
                <div>\${{ quote.amount.toFixed(2) }}</div>                             
                <button v-on:click="edit(quote)">edit quote</button>                                                        
           </div>
          <h4 v-if="qCount">{{ qCount }} quotes found</h4>
          <quote-modal v-if="showModal" :quote="quote" @close="closeModal()"></quote-modal>
         </div>`,
    props: {
        associate: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            customers: null,
            customer: '',
            quotes: null,
            quote: null,
            showModal: false
        }
    },
    methods: {
        async getCustomers() {
            var resp = await axios.get('http://localhost:3001/getCustomers')
            // console.log(resp.data);
            this.customers = resp.data
        },
        findCustomer(quote) {
            if (this.customers != null) {
                for (cust of this.customers) {
                    if (cust.id == quote.custid) {
                        quote.customer = cust;
                        return cust
                    }
                }
            }
            return {name: 'customer not found'}
        },
        closeModal() {
            this.getQuotes()
            this.showModal = false
        },
        async getQuotes() {
            var resp = await axios.get(`http://localhost:3001/getQuotes?status=open&associateid=${this.associate.id}`)
            // console.log(resp.data);
            this.quotes = resp.data
        },
        async createQuote(customer) { 
            // console.log(customer)
            this.quote = {
                date: new Date().toISOString().slice(0, 10),
                associateid: this.associate.id,
                customer: customer,
                custid: customer.id,
                amount: 0,
                commission: 0,
                status: 'open',
                items: [],
                notes: []
            }
            this.showModal = true
        },
        async edit(quote) { 
            this.quote = quote
            // console.log(quote)
            respItems = await axios.get(`http://localhost:3001/getItems?quoteid=${quote.id}`)
            this.quote.items = respItems.data
            respNotes = await axios.get(`http://localhost:3001/getNotes?quoteid=${quote.id}`)
            this.quote.notes = respNotes.data
            this.showModal = true
        }
    },
    computed: {
        cList() {
            if (this.customers == null) {
                this.getCustomers()
            }          
            return this.customers
        },
        qList() {
            if (this.quotes == null) {
                this.getQuotes()
            }          
            return this.quotes
        },
        cCount() {
            if (this.customers == null) {
                this.getCustomers()
                return 0
            }          
            return this.customers.length
        },
        qCount() {
            if (this.quotes == null) {
                this.getQuotes()
                return 0
            }          
            return this.quotes.length
        }
    }
})