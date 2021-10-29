app.component('line-item', {
    template:
        /*html*/
        `<div class="lineitem">         
            <input id="itemtext" v-model="text" :disabled="!item.status||mode=='process'||mode=='all'"> <input id="itemprice" v-model="price" :disabled="!item.status||mode=='process'||mode=='all'">&nbsp;                                         
            <div v-if="mode=='open'||mode=='final'">
                <span v-if="item.status" v-on:click="update()" class="fas fa-check"></span>               
                <span v-else v-on:click="item.status=true" class="fas fa-wrench"></span>                      
                &nbsp;<span v-on:click="remove()" class="fas fa-trash"></span>
            </div>
         </div>`,
    props: {
        item: {
            type: Object,
            required: true
        },
        mode: {
            type: String,
            required: true
        }
    },    
    data() {
        return {
            text: this.item.text,
            price: this.item.price
        }
    },
    methods: {
        update() { 
            var price = parseFloat(this.price)
            if (isNaN(price)) {
                alert('Price must be a number')
                return
            }
            this.item.price = price
            this.item.text = this.text
            this.$emit('update', this.item)  
            this.item.status = false     
        },
        remove() {
            this.$emit('remove', this.item)
        }
    }
})