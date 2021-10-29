app.component('checkout', {
    template:
        /*html*/
        `<div class="checkout">            
            <div v-if="cart.length==0">
                <h3>Your cart is empty</h3>  
            </div>  
            <div v-else-if="cart.length==1">
                <h3>You have one part in your cart</h3>  
            </div> 
            <div v-else>
                <h3>You have {{ cart.length }} parts in your cart</h3>  
            </div> 
            <div v-if="cart.length">
                <div v-for="part in cart" class="part">       
                    <img :src="part.pictureURL">
                    <div class="info">
                    {{ part.description }} <br>
                    \${{ part.price }} <br>
                    {{ part.weight }}lbs <br>
                    quantity: {{ part.quantity }}
                    </div>  
                    <button v-on:click="remove(part)">remove</button>                   
                </div> 
                <h3>Billing Information:</h3> 
                <form @submit.prevent="onSubmit" class="gridform">
                    <label class="gridlabel">Amount:</label>\${{ amount }}
                    <label class="gridlabel">Weight:</label>{{ weight }}lbs
                    <label class="gridlabel">Shipping:</label>\${{ shipping }}
                    <label class="gridlabel">Total:</label>\${{ (amount + shipping).toFixed(2) }}
                    <div class="gridlabel">&nbsp;</div> &nbsp;
                    <label for="name" class="gridlabel">Name:</label><input id="name" v-model="name">
                    <label for="email" class="gridlabel">Email:</label><input id="email" v-model="email">
                    <label for="address" class="gridlabel">Address:</label><input id="address" v-model="address">
                    <label for="cc" class="gridlabel">CC:</label><input id="cc" v-model="cc">
                    <label for="exp" class="gridlabel">Exp.:</label><input id="exp" v-model="exp">
                    <div class="gridlabel">&nbsp;</div> &nbsp;
                    <div class="checkoutbutton"><input type="submit" value="check out"></div>                   
                </form>   
            </div>  
            <checkout-modal v-if="showModal" :order="order" @close="closeModal()"></checkout-modal>
         </div>`,
    props: {
        cart: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            name: '',
            email: '',
            address: '',
            cc: '',
            exp: '',
            brackets: null,
            showModal: false,
            order: null
        }
    },
    computed: {
        amount() {
            let tmp = 0;
            for (part of this.cart) {
                tmp += part.price * part.quantity * 100
            }
            return tmp / 100
        },
        weight() {
            let tmp = 0;
            for (part of this.cart) {
                tmp += part.weight * part.quantity * 100
            }
            return tmp / 100
        },
        shipping() {
            let tmp = 0;
            if (this.brackets == null) {
                this.getBrackets()
            } else {
                for (var bracket of this.brackets) {
                    if (this.weight >= bracket.weight) {
                        tmp = bracket.cost * 100
                    }
                }
            }
            return tmp / 100
        }
    },
    methods: {
        async getBrackets() {
            var resp = await axios.get('http://localhost:3000/getBrackets')
            // console.log(resp.data);
            this.brackets = resp.data
        },
        async remove(part) {
            this.$emit('remove-from-cart', part)
        },
        closeModal() {           
            this.showModal = false
            for (part of this.cart) {
                this.$emit('remove-from-cart', part)
            }
            this.$emit('close')
        },
        onSubmit() {
            if (this.name === '' || this.email === '' || this.address === '' || this.cc === '' || this.exp === '') {
                alert('Billing information is incomplete. Please fill out every field.')
                return
            }
            const transaction = {
                vendor: "Car Parts Store",
                trans: (Math.random() * 100).toFixed(0) + "-714-989-" + (Math.random() * 1000).toFixed(0),
                name: this.name,
                cc: this.cc,
                exp: this.exp,
                amount: this.amount + this.shipping,
                weight: this.weight,
            }
            // console.log(transaction)
            axios.post('http://blitz.cs.niu.edu/creditcard', transaction).then((response) => {
                // console.log(response.data);
                if (response.data.errors != null) {
                    alert('Credit card transaction denied: ' + response.data.errors)
                    return
                }
                if (response.data.authorization !== null) {
                    this.order = {
                        name: this.name,
                        email: this.email,
                        address: this.address,
                        date: new Date().toISOString().slice(0, 10),
                        amount: this.amount,
                        weight: this.weight,
                        shipping: this.shipping,
                        status: 'open',
                        items: this.cart,
                        auth: response.data.authorization
                    }
                    axios.post('http://localhost:3000/createOrder', this.order).then((response) => {
                        console.log(response);
                        this.order.msg = response.data.msg
                        this.showModal = true                      
                    }).catch(err => {
                        throw err;
                    });
                    return
                }
            }).catch(err => {
                throw err;
            });
        }
    },
})