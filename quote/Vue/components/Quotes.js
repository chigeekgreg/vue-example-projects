app.component('quotes', {
    template:
        /*html*/
        `<div class="quotes">  
            <h3 v-if="qCount && mode=='final'">List of finalized quotes:</h3>
            <h3 v-else-if="qCount && mode=='process'">List of sanctioned quotes:</h3>
            <h3 v-else-if="qCount && mode=='all'">List of all quotes:</h3>
            <div v-else>No open quotes</div>
            <div v-if="mode==='all'" class="filterspec">           
                Date from:<input v-model="datefrom" type=date>
                &nbsp;to:<input v-model="dateto" type=date>
                <br>
                Status:<select v-model="status">
                    <option value="all">all</option>
                    <option value="finalized">finalized</option>
                    <option value="sanctioned">sanctioned</option>
                    <option value="ordered">ordered</option>
                </select>               
                    Select associate: <select v-model="associate">
                        <option value="">all</option>
                        <option v-if="aCount" v-for="associate in associates" :value="associate">{{ associate.name }}</option>
                </select>               
                Select customer: <select v-model="customer">
                    <option value="">all</option>
                    <option v-for="cust in customers" :value="cust">{{ cust.name }}</option>
                </select>
            </div>
            <div :set="count = 0">
            <div v-for="quote in quotes">           
                <div v-if="filter(quote)" class="quotegrid quote" :set="count++">           
                    {{ quote.id }}&nbsp;({{ quote.date.slice(0, 10)}}):&nbsp;{{ aName(quote) + cName(quote) }}
                    <div>\${{ quote.amount.toFixed(2) + quoteStatus(quote.status) }}</div>                             
                    <button v-if="mode=='final'" v-on:click="edit(quote)">sancion quote</button>                                                        
                    <button v-if="mode=='process'" v-on:click="edit(quote)">process order</button>                                                        
                    <button v-if="mode=='all'" v-on:click="edit(quote)">view</button>                                                        
                </div>
            </div>
            <h4 v-if="count">{{ count }} quotes found</h4>
            </div>
            <quote-modal v-if="showModal" :quote="quote" :mode="mode" @close="closeModal()"></quote-modal>
         </div>`,
    props: {
        mode: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            quotes: null,
            quote: null,
            customers: {},
            showModal: false,
            status: 'all',
            datefrom: '2021-01-01',
            dateto: new Date().toISOString().slice(0, 10),
            customer: '',
            associates: null,
            associate: ''
        }
    },
    methods: {
        aName(quote) {
            if (this.aCount) {
                for (assoc of this.associates) {
                    if (assoc.id == quote.associateid) {
                        return assoc.name + ' - '
                    }
                }
            }
            return ''
        },
        cName(quote) {
            if (!quote.customer) {
                this.findCustomer(quote)
                return "..."
            }
            return quote.customer.name
        },
        async findCustomer(quote) {
            if (this.customers[quote.custid]) {
                quote.customer = this.customers[quote.custid]
            } else {
                var resp = await axios.get(`http://localhost:3001/getCustomers?id=${quote.custid}`)
                // console.log(resp)
                quote.customer = resp.data[0]
                this.customers[quote.custid] = quote.customer
            }
            return quote.customer
        },
        closeModal() {
            this.getQuotes()
            this.showModal = false
        },
        async getQuotes() {
            var query = ''
            if (this.mode !== 'all') {
                query = '?status=' + ((this.mode=='final')?'finalized':'sanctioned')
            }
            var resp = await axios.get(`http://localhost:3001/getQuotes${query}`)
            // console.log(resp.data);
            this.quotes = resp.data
        },
        async edit(quote) { 
            this.quote = quote
            // console.log(quote)
            respItems = await axios.get(`http://localhost:3001/getItems?quoteid=${quote.id}`)
            this.quote.items = respItems.data
            respNotes = await axios.get(`http://localhost:3001/getNotes?quoteid=${quote.id}`)
            this.quote.notes = respNotes.data
            this.showModal = true
        },
        quoteStatus(status) {
            var sField = ''
            if (this.mode === 'all') {
                switch (status) {
                    case 'open':
                    case 'finalized':
                    case 'sanctioned':
                        sField = status
                        break
                    default:
                        sField = 'ordered'
                }
                sField = ` (${sField})`
            }
            return sField
        },
        async getAssociates() {
            var resp = await axios.get('http://localhost:3001/getAssociates')
            // console.log(resp.data);
            this.associates = resp.data
        },
        filter(quote) {
            return this.filterStatus(quote) && this.filterDate(quote) && this.filterAssociate(quote) && this.filterCustomer(quote);
        },
        filterStatus(quote) {
            if (this.status === 'all') return true;
            if (this.status === quote.status) return true;
            if (this.status === 'ordered' && quote.status.includes('/')) return true;
            return false
        },
        filterAssociate(quote) {
            if (this.associate === '') return true;
            if (this.associate.id === quote.associateid) return true;
            return false
        },
        filterCustomer(quote) {
            if (this.customer === '') return true;
            if (this.customer.id === quote.custid) return true;
            return false
        },
        filterDate(quote) {
            return (quote.date.slice(0, 10)) >= this.datefrom &&
                    (quote.date.slice(0, 10)) <= this.dateto
        }
    },
    computed: {
        qCount() {
            if (this.quotes == null) {
                this.getQuotes()
                return 0
            }          
            return this.quotes.length
        },
        aCount() {
            if (this.associates == null) {
                this.getAssociates()
                return 0
            }          
            return this.associates.length
        }
    }
})