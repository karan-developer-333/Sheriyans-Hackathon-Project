import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
    organizationName:{
        type:String,
        required:true,
    },
    organizationJoinCode:{
        type:String,
        required:true,
        unique:true,
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true,
    }
});

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;