import express, {Request,Response, NextFunction} from "express";
import {json, urlencoded} from "body-parser";
import mongoose, { ConnectOptions } from "mongoose";
import cors from "cors";


const app = express();
app.use(cors());

mongoose.connect(
  "mongodb://localhost:27017/formbuilder1",
  {
    autoIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  } as ConnectOptions,
  (err) => {
    if (!err) {
      console.log("Connected to db");
    } else {
      console.log("Error connecting to db");
    }
  }
);

const formSchema = new mongoose.Schema({
    id: Number,
    form_title: String, 
    components: [{
        id: Number,
        element: String,
        label: String,
        placeholder: String,
        required: Boolean,

        minLength: Number,
        maxLength: Number,
        rows: Number,

        minRows: Number,
        width: Number,

        checked: Boolean,
        default: Boolean,
        error: String,

        multipleValues: Boolean,
        menuItems: [
            {
            id: String,
            selectDataLabel: String,
            selectDataValue: String,
            },
        ],
        textFieldWidth: Number,

        theme: String,
        size: String,

        options: String,
        radioItems: [
            {
            radioButtonDataLabel: String,
            radioButtonDataValue: String,
            },
        ],

        tabItems: [{
          id: String,
          tabsDataLabel: String,
          tabsDataValue: String,
          tabComponents:  [{
            id: Number,
        element: String,
        label: String,
        placeholder: String,
        required: Boolean,

        minLength: Number,
        maxLength: Number,
        rows: Number,

        minRows: Number,
        width: Number,

        checked: Boolean,
        default: Boolean,
        error: String,

        multipleValues: Boolean,
        menuItems: [
            {
            id: String,
            selectDataLabel: String,
            selectDataValue: String,
            },
        ],
        textFieldWidth: Number,

        theme: String,
        size: String,

        options: String,
        radioItems: [
            {
            radioButtonDataLabel: String,
            radioButtonDataValue: String,
            },
        ],
        show: Boolean
          }]
        }],
    
        columnItems: [{
            id: String,
            label: String,
            columnDataSize: String,
            columnDataWidth: Number,
            columnComponents:  [{
              id: Number,
              element: String,
              label: String,
              placeholder: String,
              required: Boolean,
      
              minLength: Number,
              maxLength: Number,
              rows: Number,
      
              minRows: Number,
              width: Number,
      
              checked: Boolean,
              default: Boolean,
              error: String,
      
              multipleValues: Boolean,
              menuItems: [
                  {
                  id: String,
                  selectDataLabel: String,
                  selectDataValue: String,
                  },
              ],
              textFieldWidth: Number,
      
              theme: String,
              size: String,
      
              options: String,
              radioItems: [
                  {
                  radioButtonDataLabel: String,
                  radioButtonDataValue: String,
                  },
              ],
              show: Boolean
            }]
          }],  

        show: Boolean
    }],
    date_created: String,
    date_modified: String,
    status: String
})

const Form =  mongoose.model('Form', formSchema);

app.use(urlencoded({
  extended: true
}))
app.use(json())


declare global {
  interface CustomError extends Error {
    status?: number
  }
}

app.post('/api/form/',async (req: Request, res: Response, next: NextFunction) => {
  console.log("Inside post")
  const {id,form_title, components, date_created, date_modified,status} = req.body

  if(!id || !form_title || !components || !date_created || !date_modified || !status){
      const error = new Error('Data is Required') as CustomError
      error.status = 400;
      return next(error)
  }

  const newForm = new Form({
      id,form_title, components, date_created, date_modified,status  
  })

  await newForm.save()

  res.status(201).send(newForm)

})


app.get('/api/form/show/:id', async (req: Request, res: Response, next: NextFunction) => {
  console.log("Inside Get Function");
  const {id} = req.params;

  Form.findOne({
    id: id
},function (err: any, val: any) {
  if (err) {
    res.send("Error");
  }
  if (!val) {
    res.send("Data does not exist");
  } else {
    res.send(val);
  }
  })
})

app.get('/api/form/getFormName/:formName', async (req: Request, res: Response, next: NextFunction) => {
  console.log("Inside Get Function");
  const {formName} = req.params;

  Form.findOne({
    form_title: formName
},function (err: any, val: any) {
  if (err) {
    res.send("Error");
  }
  if (!val) {
    res.send("Data does not exist");
  } else {
    res.send(val);
  }
  })
})

app.get('/api/form/showAll/', async (req: Request, res: Response, next: NextFunction) => {
  console.log("Inside Get Function");
  
  Form.find({
   
},function (err: any, val: any) {
  if (err) {
    res.send("Error");
  }
  if (!val) {
    res.send("Data does not exist");
  } else {
    res.send(val);
  }
  })
})



app.put('/api/form/update/:id',async (req: Request, res: Response, next: NextFunction) => {
  const {id} = req.params
  console.log(req.body)
  const {form_title, components, date_created, date_modified,status} = req.body

  if(!id ){
      const error = new Error('Data is Required') as CustomError
      error.status = 400;
      return next(error)
  }

  let updatedForm;
  
  try{
      const updatedForm = await Form.findOneAndUpdate(
          {
              id: id
          },
          {
              $set: { id,form_title,components, date_created, date_modified,status} 
          },
          {
              new: true
          }
      )
  }catch(err){
      const error = new Error('Form cannot be updated') as CustomError
      error.status = 400 
      next(error)
  }
  res.status(200).send(updatedForm)
})

app.delete('/api/form/delete/:id', async (req: Request, res: Response, next: NextFunction) => {
  const {id} = req.params;

  if(!id){
      const error = new Error('post id is required') as CustomError;
      error.status = 400
      next(error)
  }

  try{
      await Form.findOneAndRemove({ id: id})
  }catch(err){
      next(new Error('Form cannot be updated'))
  }

  res.status(200).json({success: true})
})

//
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

app.post("/api/signup", async (req, res) => {
  try {
    const { email, password, firstname, lastname } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const newUser = new User({
      email,
      password,
      firstname,
      lastname,
    });

    await newUser.save();

    return res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
});


app.post('/api/signin', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find the user with the given email
    const user = await User.findOne({ email });
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    const isMatch = password === user.password
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    const {_id, firstname, lastname, email: userEmail } = user;
    return res.status(200).json({_id, firstname,lastname, email: userEmail });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});



app.listen(4000, () => {
  console.log("On port 4000");
});
