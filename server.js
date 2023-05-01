const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');

const app = new Koa();

const items = [];

app.use(koaBody({
    urlencoded: true,
    multipart: true,
}))

app.use((ctx, next) => {
    if (ctx.request.method !== 'OPTIONS') {
      next();
  
      return;
    }
  
    ctx.response.set('Access-Control-Allow-Origin', '*');
  
    ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');
  
    ctx.response.status = 204;
  });


    // Добавление данных на сервер
app.use((ctx, next) => {
    if(ctx.request.method !== 'POST') {
        next();

        return
    }

    ctx.response.set('Access-Control-Allow-Origin', '*');

    const {name, textarea} = ctx.request.body;

    const responseObj = generateTaskObj(name, textarea);

    ctx.response.body = responseObj;

})


    //Отправка данных с сервера 
app.use((ctx, next) => {
    if(ctx.request.method !== 'GET') {
        next();

        return;
    }

    ctx.response.set('Access-Control-Allow-Origin', '*');

    const { method, id } = ctx.request.query;

    switch (method) {
        case 'allTasks':
            ctx.response.body = JSON.stringify(items);
            return;

        case 'fullTask':
            ctx.response.body = JSON.stringify(getTaskObj(id));
            return;

        case 'description':
            ctx.response.body = JSON.stringify(getTaskObj(id).description);
            return;

        default:
            ctx.response.status = 404;
            return;
    }
});


    // удаление данных с сервера
app.use((ctx, next) => {
    if (ctx.request.method !== 'DELETE') {
      next();
  
      return;
    }

    ctx.response.set('Access-Control-Allow-Origin', '*');
    
    const { id } = ctx.request.query;

    deleteItem(id);

    ctx.response.body = `ok`;

})


    // обновление данных сервера
app.use((ctx, next) => {
    if (ctx.request.method !== 'PATCH') {
      next();
      
      return;
    }
    
    ctx.response.set('Access-Control-Allow-Origin', '*');

    const { id, status } = ctx.request.query;
    let item = {};

    if(status) {
        item = patchItem(id, status);
    } else {
        item = patchItem(id, ctx.request.body);
    }

    ctx.response.body = item;
    
});


const server = http.createServer(app.callback());

const port = 7060;

server.listen(port, (err) => {
    if(err) {
        console.log(err);

        return
    }

    console.log(`server on ${port}`)
});



function generateTaskObj(name, textarea) {
    const setDate = new Date();
    let date = [setDate.getFullYear(), setDate.getMonth(), setDate.getDay()].join('.');
    const time = setDate.getHours();
    date = `${date} ${time}`;

    let obj = {
        id: (new Date()).getTime(),
        status: false,
        description: textarea,
        name: name,
        created: date
    }

    items.push(obj);
    return obj;
    
}

function getTaskObj(id){
    for(let i = 0; i < items.length; i++) {
        if(items[i].id == id) {
            return items[i];
        }
    }
}

function patchItem(id, body) {
    for(let i = 0; i < items.length; i++) {
        if(items[i].id == id) {
            if(body == `true` || body == `false`){
                items[i].status = body;
            }

            if(body.name) {
                items[i].name = body.name;
                items[i].description = body.textarea;
            }
            return items[i];
        }
    }
}

function deleteItem(id) {
    let index;
    
    for(let i = 0; i < items.length; i++) {
        if(items[i].id == id){
            index = i;
        }
    }

    if(index || index == 0) {
        items.splice(index, 1);
    }
}