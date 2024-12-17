class ApiFeatures {
constructor(query,queryStr){
  this.query=query,
  this.queryStr=queryStr
}

    search()
     {
      const keyword=this.queryStr.keyword 
      ?
      {
        productName:{
          // regular expression
          $regex:this.queryStr.keyword, 
          // case insntitive upper or lower
          $options:"i"
        }
      }:{}

    
// console.log(keyword);
this.query=this.query.find({...keyword})



// returning this class
return this;
    }
    filter()
    {
      const queryCopy={...this.queryStr}
     
      // removing fields from category
      const removeField=["keyword","page","limit"]
      removeField.forEach((key)=>delete queryCopy[key]);

      // filter for price and ratting

      let queryStr=JSON.stringify(queryCopy)
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);

        // console.log('Query string after adding operators:', queryStr);

       this.query=this.query.find(JSON.parse(queryStr))

      return this
    }

    pagination(productPerPage) {
      const currentPage = Number(this.queryStr.page) || 1;
  
      const skip = productPerPage * (currentPage - 1);
  
      this.query = this.query.limit(productPerPage).skip(skip);
  
      return this;
    }

}



module.exports=ApiFeatures