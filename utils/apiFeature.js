class APIFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1. Filtering
  filter() {
    const queryObject = { ...this.queryString };
    const excludedField = ["page", "sort", "limit", "fields"];

    excludedField.forEach((el) => delete queryObject[el]);
    // console.log(queryObject);
    // 1B, Advance filtering

    // { duration: { $gte: '5' }, difficulty: 'easy', price: { '$lt': '500' } } la object filtering hợp lệ của mongo db
    let queryStr = JSON.stringify(queryObject);
    // thay the gte bang $gte , lt với $lt
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`);
    console.log(queryObject, JSON.parse(queryStr));
    this.query.find(JSON.parse(queryStr));
    return this;
  }
  // 2. Sorting

  sort() {
    //   neu trong query string co  sort
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      // console.log(this.queryString.sort, sortBy);
      // sort('price duration') : sort theo tăng dần , giảm dần thì sử dụng -price , -duration
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("createdAt");
    }
    return this;
  }

  // 3 : fields limit
  limit() {
    //   neu trong query string co  limit
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      // select('-__v') -> chon tat ca cac truong tru truong __v trong document
      this.query = this.query.select("-__v");
    }
    return this;
  }

  // 4 pagination
  pagination() {
    //   neu trong query string co limit
    const pageValue = this.queryString.page * 1 || 1;
    // limit value : dùng được cả trong các trường hợp chọn ra số lượng ... nhất
    const limitValue = this.queryString.limit * 1 || 100;
    const skipValue = (pageValue - 1) * limitValue;

    // query = query.skip(<số ptu cần skip để đến được page >).limit(<số limit>)
    this.query = this.query.skip(skipValue).limit(limitValue);
    return this;
  }
}
module.exports = APIFeature;
