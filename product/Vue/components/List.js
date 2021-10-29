app.component('list', {
    template:
        /*html*/
        `<div class="orders">  
          <h3>List of orders</h3><hr>
          Select a filter:<br>
          <div class="filtergrid">
            Date from:<input v-model="datefrom" type=date>
            &nbsp;to:<input v-model="dateto" type=date>
            Status:<select v-model="status">
                <option value="all">All</option>
                <option value="open">Authorized</option>
                <option value="filled">Shipped</option>
            </select>
            <div>&nbsp;</div><div>&nbsp;</div>
            Prize from:<input v-model="prizefrom" type=number class="prize">
            &nbsp;to:<input v-model="prizeto" type=number class="prize">
          </div>
          <hr>
          <div :set="count=0">
             <div v-for="order in list">
                <div v-if="filter(order)" class="orderlist" v-on:click="detail(order)" :set="count++">
                    <div>Id: {{ order.id }}({{order.status}}):</div>
                    <div>{{ order.date.slice(0, 10) }}</div>
                    <div>\${{ (order.amount + order.shipping).toFixed(2) }}</div>               
                    <button>detail</button>  
                </div>                          
             </div>
             <hr>
             <h4>{{ count }} orders found</h4>
             <order-modal v-if="showModal" :order="order" @close="showModal=false"></order-modal>
          </div>
         </div>`,
    data() {
        return {
            orders: null,
            order: null,
            showModal: false,
            status: 'all',
            datefrom: '2021-01-01',
            dateto: new Date().toISOString().slice(0, 10),
            prizefrom: 0,
            prizeto: 99999
        }
    },
    methods: {
        async getOrders() {
            var resp = await axios.get('http://localhost:3000/getOrders')
            // console.log(resp.data);
            this.orders = resp.data
        },
        filter(order) {
            return this.filterStatus(order) && this.filterPrize(order) && this.filterDate(order);
        },
        filterStatus(order) {
            if (this.status === 'all') return true;
            return order.status === this.status;
        },
        filterPrize(order) {
            return (order.amount + order.shipping) >= this.prizefrom &&
                    (order.amount + order.shipping) <= this.prizeto
        },
        filterDate(order) {
            return (order.date.slice(0, 10)) >= this.datefrom &&
                    (order.date.slice(0, 10)) <= this.dateto
        },
        async detail(order) { 
            var resp = await axios.get('http://localhost:3000/getOrder?id=' + order.id)
            this.order = resp.data[0]
            for (item of this.order.items) {
                var resp = await axios.get('http://localhost:3000/getParts?number=' + item.partnumber)
                item.part = resp.data[0]
            }
            // let text = `Detail for Order: ${order.id}, Status: ${order.status==='open'?'Authorized':'Shipped'}\n\n`;
            // text += `${order.name}, ${order.address}, ${order.email}, ${order.date.slice(0, 10)}\n\n`         
            // for (item of order.items) {
            //     text += `${item.quantity} - ${item.part.description} \$${item.part.price}\n`
            // }
            // text += `\nAmount: \$${order.amount} + \$${order.shipping}(s&h) = \$${order.shipping + order.amount}\n`
            // alert(text)
            this.showModal = true
        }
    },
    computed: {
        list() {
            if (this.orders == null) {
                this.getOrders()
            }          
            return this.orders
        }
    }
})