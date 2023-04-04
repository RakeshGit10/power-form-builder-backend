"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
mongoose_1.default.connect("mongodb://localhost:27017/newformbuilder", {
    autoIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, (err) => {
    if (!err) {
        console.log("Connected to db");
    }
    else {
        console.log("Error connecting to db");
    }
});
//
const userSchema = new mongoose_1.default.Schema({
    userId: { type: Number, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
});
const User = mongoose_1.default.model("User", userSchema);
const menuItemSchema = new mongoose_1.default.Schema({
    id: String,
    selectDataLabel: String,
    selectDataValue: String
});
const radioButtonSchema = new mongoose_1.default.Schema({
    id: String,
    radioButtonDataLabel: String,
    radioButtonDataValue: String
});
const validateSchema = new mongoose_1.default.Schema({
    required: Boolean,
    minLength: { type: Number, required: false },
    maxLength: { type: Number, required: false },
    rows: { type: Number, required: false },
    error: { type: String, required: false },
});
const elementSchema = new mongoose_1.default.Schema({
    id: Number,
    element: String,
    label: String,
    placeholder: String,
    validate: validateSchema,
    width: Number,
    checked: Boolean,
    default: Boolean,
    multipleValues: Boolean,
    menuItems: [menuItemSchema],
    textFieldWidth: Number,
    theme: String,
    size: String,
    options: String,
    radioItems: [radioButtonSchema],
    show: Boolean
});
const tabItemsSchema = new mongoose_1.default.Schema({
    id: String,
    dropId: String,
    tabsDataLabel: String,
    tabsDataValue: String,
    tabComponents: [elementSchema]
});
const columnItemsSchema = new mongoose_1.default.Schema({
    id: String,
    label: String,
    columnDataSize: String,
    columnDataWidth: Number,
    columnComponents: [elementSchema]
});
const componentSchema = new mongoose_1.default.Schema({
    id: Number,
    element: String,
    label: String,
    placeholder: String,
    validate: validateSchema,
    width: Number,
    checked: Boolean,
    default: Boolean,
    multipleValues: Boolean,
    menuItems: [menuItemSchema],
    textFieldWidth: Number,
    theme: String,
    size: String,
    options: String,
    radioItems: [radioButtonSchema],
    tabItems: [tabItemsSchema],
    columnItems: [columnItemsSchema],
    show: Boolean
});
const formSchema = new mongoose_1.default.Schema({
    id: Number,
    form_title: String,
    owner: String,
    components: [componentSchema],
    date_created: String,
    date_modified: String,
    status: String
});
const Form = mongoose_1.default.model('Form', formSchema);
app.use((0, body_parser_1.urlencoded)({
    extended: true
}));
app.use((0, body_parser_1.json)());
async function encryptPassword(password) {
    const salt = await bcrypt_1.default.genSalt(10);
    const hash = await bcrypt_1.default.hash(password, salt);
    return hash;
}
app.post('/api/form/', async (req, res, next) => {
    console.log("Inside Form Post");
    const { id, form_title, owner, components, date_created, date_modified, status } = req.body;
    if (!id || !form_title || !owner || !components || !date_created || !date_modified || !status) {
        const error = new Error('Data is Required');
        error.status = 400;
        return next(error);
    }
    const newForm = new Form({
        id, form_title, owner, components, date_created, date_modified, status
    });
    await newForm.save();
    res.status(201).send(newForm);
});
app.get('/api/form/show/:id', async (req, res, next) => {
    console.log("Inside Get By Id Function");
    const { id } = req.params;
    console.log(id);
    Form.findOne({
        id: id,
        "components.menuItems": { $exists: true, $ne: [] },
        // "components.radioItems": { $exists: true, $ne: [] },
        // "components.tabItems": { $exists: true, $ne: [] },
        // "components.columnItems": { $exists: true, $ne: [] },
    }, function (err, val) {
        if (err) {
            res.send("Error");
        }
        if (!val) {
            console.log(val);
            res.send("Data does not exist");
        }
        else {
            res.send(val);
        }
    });
});
app.get('/api/form/getFormName/:formName', async (req, res, next) => {
    console.log("Inside Get FormName Function");
    const { formName } = req.params;
    Form.find({
        form_title: formName
    }, function (err, val) {
        if (err) {
            res.send("Error");
        }
        if (!val) {
            res.send("Data does not exist");
        }
        else {
            res.send(val);
        }
    });
});
app.get('/api/form/getFormByOwner/:formOwner', async (req, res, next) => {
    console.log("Inside Get Form by Owner Function");
    const { formOwner } = req.params;
    Form.find({ owner: formOwner }, function (err, val) {
        if (err) {
            res.send("Error");
        }
        if (!val) {
            res.send("Data does not exist");
        }
        else {
            res.send(val);
        }
    });
});
app.get('/api/form/showAll/', async (req, res, next) => {
    console.log("Inside Get All Forms Function");
    Form.find({}, function (err, val) {
        if (err) {
            res.send("Error");
        }
        if (!val) {
            res.send("Data does not exist");
        }
        else {
            res.send(val);
        }
    });
});
app.put('/api/form/update/:id', async (req, res, next) => {
    console.log("Inside Form Update Function");
    const { id } = req.params;
    console.log(req.body);
    const { form_title, owner, components, date_created, date_modified, status } = req.body;
    if (!id) {
        const error = new Error('Data is Required');
        error.status = 400;
        return next(error);
    }
    let updatedForm;
    try {
        const updatedForm = await Form.findOneAndUpdate({
            id: id
        }, {
            $set: { id, form_title, owner, components, date_created, date_modified, status }
        }, {
            new: true
        });
    }
    catch (err) {
        const error = new Error('Form cannot be updated');
        error.status = 400;
        next(error);
    }
    res.status(200).send(updatedForm);
});
app.delete('/api/form/delete/:id', async (req, res, next) => {
    console.log("Inside Form Delete Function");
    const { id } = req.params;
    if (!id) {
        const error = new Error('post id is required');
        error.status = 400;
        next(error);
    }
    try {
        await Form.findOneAndRemove({ id: id });
    }
    catch (err) {
        next(new Error('Form cannot be updated'));
    }
    res.status(200).json({ success: true });
});
app.post("/api/signup", async (req, res) => {
    console.log("Inside User Post Function");
    try {
        const { userId, email, password, firstname, lastname } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const hashedPassword = await encryptPassword(password);
        console.log(hashedPassword);
        const newUser = new User({
            userId,
            email,
            password: hashedPassword,
            firstname,
            lastname,
        });
        await newUser.save();
        return res.status(200).json({ message: "User created successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error" });
    }
});
app.post('/api/signin', async (req, res) => {
    console.log("User Login Function");
    const { email, password } = req.body;
    try {
        // Find the user with the given email
        const user = await User.findOne({ email });
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        try {
            const isValid = await bcrypt_1.default.compare(password, user.password);
            console.log(isValid, "isValid");
            if (!isValid) {
                console.log("inside");
                return res.status(400).json({ message: 'Invalid password' });
            }
            else {
                const { _id, userId, firstname, lastname, email: userEmail } = user;
                return res.status(200).json({ _id, userId, firstname, lastname, email: userEmail });
            }
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});
app.get('/api/user/getPassword/:user_id', async (req, res, next) => {
    console.log("Inside Get Password Function");
    const { user_id } = req.params;
    console.log(user_id);
    User.findOne({
        userId: user_id
    }, function (err, val) {
        if (err) {
            res.send("Error");
        }
        if (!val) {
            res.send("Data does not exist");
        }
        else {
            res.send(val);
        }
    });
});
app.put('/api/user/update-profile/:user_Id', async (req, res, next) => {
    console.log("Inside User Update Profile");
    const { user_Id } = req.params;
    console.log(req.body);
    let { userId, firstname, lastname, email, password } = req.body;
    if (!user_Id) {
        const error = new Error('Data is Required');
        error.status = 400;
        return next(error);
    }
    let updatedForm;
    if (password) {
        const hashedPassword = await encryptPassword(password);
        console.log("Changed Password", hashedPassword);
        password = hashedPassword;
    }
    try {
        const updatedForm = await User.findOneAndUpdate({
            userId: user_Id
        }, {
            $set: { userId, firstname, lastname, email, password }
        }, {
            new: true
        });
    }
    catch (err) {
        const error = new Error('User profile cannot be updated');
        error.status = 400;
        next(error);
    }
    res.status(200).send(updatedForm);
});
app.listen(4000, () => {
    console.log("On port 4000c");
});
//# sourceMappingURL=main.js.map