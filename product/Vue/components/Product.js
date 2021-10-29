app.component('product', {
    template:
        /*html*/
        `<div class="part">         
                <img :src="part.pictureURL">
                <div class="info" v-if="type==='ordering'">
                   {{ part.description }} <br>
                   \${{ part.price }} <br>
                   {{ part.weight }}lbs <br>
                   available: {{ part.quantity }}
                </div>  
                <div class="info" v-else>
                   {{ part.description }} <br>
                   \${{ part.price }} <br>
                   {{ part.weight }}lbs <br>
                   quantity on hand: {{ part.quantity }}
                </div>                 
                <label for="quantity">Quantity:</label><input id="quantity" size=3 v-model="quantity"> &nbsp;                          
                <button v-if="type==='ordering'" v-on:click="addToCart(part)" :disabled="part.quantity==0">Add to Cart</button>               
                <button v-else v-on:click="update(part)" :disabled="quantity==0">update quantity</button>                          
         </div>`,
    props: {
        part: {
            type: Object,
            required: true
        },
        type: {
            type: String,
            required: true
        }
    },    
    data() {
        return {
            quantity: (this.type === 'ordering' && this.part.quantity > 0)?1:0
        }
    },
    methods: {
        async addToCart(part) {
            var quant = parseInt(this.quantity)
            if (isNaN(quant)) {
                alert('Quantity must be an integer number')
                return
            } 
            if (quant > part.quantity) {
                alert('Quantity requested exceeds quantity available')
                return
            } else {
                let orderPart = { ...part }
                orderPart.quantity = quant
                this.$emit('add-to-cart', orderPart)
            } 
            this.quantity = 1        
        },
        async update(part) { 
            var quant = parseInt(this.quantity)
            if (isNaN(quant)) {
                alert('Quantity must be an integer number')
                return
            }
            this.$emit('update', part, quant)  
            this.quantity = 0      
        }
    },
    computed: {
        howmany() {
            if (this.part.quantity === 0) {
                return 0
            } 
            return this.quantity
        }
    }
})