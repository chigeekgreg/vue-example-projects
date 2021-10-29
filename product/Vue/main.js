const app = Vue.createApp({
    data() {
        return {
            cart: [],
            content: "list",
        }
    },
    methods: {
        updateCart(part) {
            this.cart.push(part)
            // console.log(this.cart)
        },
        removeCart(part) {
            var other = this.cart;
            this.cart = [];
            for (p of other) {
                if (p !== part) {
                    this.cart.push(p)
                }
            }           
            // console.log(this.cart)
        },
    }
  })
  