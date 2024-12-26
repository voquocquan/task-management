const Task = require("../models/task.model");
const paginationHelper = require("../../../helpers/pagination")

// [GET] /api/v1/tasks
module.exports.index = async (req, res) => {
  const find = {
    deleted: false,
  };
  //filter status
  if(req.query.status) {
    find.status = req.query.status
  }
  //end filter status

  //sort
  const sort = {};
  if(req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  }
  //end sort

  //phân trang (pagination)
  const countTasks = await Task.countDocuments(find);
  let objectPagination = paginationHelper(2, req.query, countTasks);

  //

  //tìm kiếm
  if(req.query.keyword) {
   
    const regex = new RegExp(req.query.keyword, "i");
    find.title = regex;
}
  //end tìm kiếm
  
  const tasks = await Task.find(find)
    .sort(sort)
    .limit(objectPagination.limitItems)
    .skip(objectPagination.skip);
    
  res.json(tasks)
};

// [GET] /api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
  const id = req.params.id
  const tasks = await Task.findOne({
    _id:id,
    deleted: false
  })
  
  res.json(tasks)
};