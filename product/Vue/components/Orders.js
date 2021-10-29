app.component('orders', {
    template:
        /*html*/
        `<div class="orders">  
          <div v-if="count">List of open orders:</div>
          <div v-else>No open orders</div>
           <div v-for="order in list">
            <div class="order">
                <div class="info">
                   Order Id: {{ order.id }} <br>
                   \${{ (order.amount + order.shipping).toFixed(2) }} <br>
                   {{ order.weight }}lbs
                </div>               
                <button v-on:click="complete(order)">complete order</button>                             
            </div>
           </div>
          <h4>{{ count }} orders found</h4>
          <fill-modal v-if="showModal" :order="order" @close="closeModal()" @cancel="showModal=false"></fill-modal>
         </div>`,
    data() {
        return {
            orders: null,
            order: null,
            showModal: false
        }
    },
    methods: {
        async getOrders() {
            var resp = await axios.get('http://localhost:3000/getOrders?status=open')
            // console.log(resp.data);
            this.orders = resp.data
        },
        async complete(order) { 
            var resp = await axios.get('http://localhost:3000/getOrder?id=' + order.id)
            this.order = resp.data[0]
            // order.parts = [];
            for (item of this.order.items) {
                var resp = await axios.get('http://localhost:3000/getParts?number=' + item.partnumber)
                item.description = resp.data[0].description;
                item.price = resp.data[0].price;
                item.available = resp.data[0].quantity;
                // order.parts.push(resp.data[0])
            }
            this.showModal = true
        },
        async closeModal() {
            this.showModal = false
            resp = await axios.get('http://localhost:3000/closeOrder?id=' + this.order.id)
            // update inventory
            for (item of this.order.items) {
                axios.get(`http://localhost:3000/setInventory?id=${item.partnumber}&quantity=${item.available - item.quantity}`) 
            }
            this.getOrders()
        }
    },
    computed: {
        list() {
            if (this.orders == null) {
                this.getOrders()
            }          
            return this.orders
        },
        count() {
            return this.orders == null?0:this.orders.length
        }
    }
})