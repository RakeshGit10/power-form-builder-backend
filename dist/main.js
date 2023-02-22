"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
mongoose_1.default.connect("mongodb://localhost:27017/formbuilder1", {
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
const formSchema = new mongoose_1.default.Schema({
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
                    tabComponents: [{
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
                    columnComponents: [{
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
});
const Form = mongoose_1.default.model('Form', formSchema);
app.use((0, body_parser_1.urlencoded)({
    extended: true
}));
app.use((0, body_parser_1.json)());
app.post('/api/form/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Inside post");
    const { id, form_title, components, date_created, date_modified, status } = req.body;
    if (!id || !form_title || !components || !date_created || !date_modified || !status) {
        const error = new Error('Data is Required');
        error.status = 400;
        return next(error);
    }
    const newForm = new Form({
        id, form_title, components, date_created, date_modified, status
    });
    yield newForm.save();
    res.status(201).send(newForm);
}));
app.get('/api/form/show/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Inside Get Function");
    const { id } = req.params;
    Form.findOne({
        id: id
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
}));
app.get('/api/form/getFormName/:formName', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Inside Get Function");
    const { formName } = req.params;
    Form.findOne({
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
}));
app.get('/api/form/showAll/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Inside Get Function");
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
}));
app.put('/api/form/update/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    console.log(req.body);
    const { form_title, components, date_created, date_modified, status } = req.body;
    if (!id) {
        const error = new Error('Data is Required');
        error.status = 400;
        return next(error);
    }
    let updatedForm;
    try {
        const updatedForm = yield Form.findOneAndUpdate({
            id: id
        }, {
            $set: { id, form_title, components, date_created, date_modified, status }
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
}));
app.delete('/api/form/delete/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    if (!id) {
        const error = new Error('post id is required');
        error.status = 400;
        next(error);
    }
    try {
        yield Form.findOneAndRemove({ id: id });
    }
    catch (err) {
        next(new Error('Form cannot be updated'));
    }
    res.status(200).json({ success: true });
}));
//
const userSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
});
const User = mongoose_1.default.model("User", userSchema);
app.post("/api/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, firstname, lastname } = req.body;
        const user = yield User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Email already registered" });
        }
        const newUser = new User({
            email,
            password,
            firstname,
            lastname,
        });
        yield newUser.save();
        return res.status(200).json({ message: "User created successfully" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server Error" });
    }
}));
app.post('/api/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Find the user with the given email
        const user = yield User.findOne({ email });
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = password === user.password;
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        const { _id, firstname, lastname, email: userEmail } = user;
        return res.status(200).json({ _id, firstname, lastname, email: userEmail });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}));
app.listen(4000, () => {
    console.log("On port 4000");
});
