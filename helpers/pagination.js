module.exports = (limitItems, query, countTasks) => {
    const objectPagination = {
        curentPage: 1,
        limitItems: limitItems  
    }

    if(query.page){
        objectPagination.curentPage = parseInt(query.page);
    };

    if(query.limit){
        objectPagination.limitItems = parseInt(query.limit);
    };

    objectPagination.skip = (objectPagination.curentPage - 1) * objectPagination.limitItems;
    
    const totalPage = Math.ceil(countTasks / objectPagination.limitItems);
    objectPagination.totalPage = totalPage;

    return objectPagination;
}