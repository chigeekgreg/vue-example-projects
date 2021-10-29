app.component('receive', {
    template:
        /*html*/
        `<div class="display"> 
          <input v-model="search" placeholder="query"> Filter by Part Description or Part Number  
          <div v-if="search!= ''">List of parts that match your query:</div>
          <div v-else>All parts (enter search criteria above to filter results)</div>
          <div :set="count = 0">
           <div v-for="part in list">
            <div v-if="filter(part, search)" :set="count++">
                <product :part="part" :type="'receiving'" @update="update"></product>
                <!-- <img :src="part.pictureURL">
                // <div class="info">
                //    {{ part.number }}: {{ part.description }} <br>
                //    \${{ part.price }} <br>
                //    {{ part.weight }}lbs <br>
                //    quantity on hand: {{ part.quantity }}
                // </div> 
                // <label for="quantity">Quantity:</label><input id="quantity" type="number" v-model="received"> &nbsp;           
                // <button v-on:click="update(part)">update quantity</button>   -->            
            </div>
           </div>
          </div>
          <h3>{{ count }} parts found</h3>
         </div>`,
    data() {
        return {
            parts: null,
            search: '',
            received: 0,
            showGroup: {}
        }
    },
    methods: {
        filter(part, search) {
            return (part.description.toLowerCase().includes(search.toLowerCase()) ||
            part.number == search)
        },
        async getParts() {
            var resp = await axios.get('http://localhost:3000/getParts')
            // console.log(resp.data);
            this.parts = resp.data
        },
        async update(part, quantity) { 
            // console.log(part, quantity)
            part.quantity += quantity
            var resp = await axios.get(`http://localhost:3000/setInventory?id=${part.number}&quantity=${part.quantity}`)        
            // console.log(resp)
        }
    },
    computed: {
        list() {
            if (this.parts == null) {
                this.getParts()
            } 
            return this.parts
        }
    }
})