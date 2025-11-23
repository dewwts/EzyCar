const Provider = require('../models/Provider');
const asyncHandler = require('../middleware/async');

//@desc Get all providers
//@route GET /api/v1/providers
//@access Private
exports.getProviders = asyncHandler(async (req, res, next)=>{
    const providers = await Provider.find();
    res.status(200).json({success:true, count: providers.length, data: providers});
});

//@desc Get single provider
//@route GET /api/v1/providers/:id
//@access Private
exports.getProvider = asyncHandler(async(req, res, next)=>{
    const provider = await Provider.findById(req.params.id);
    if(!provider){
        res.status(404).json({success:false, msg: 'Provider not found'});
    }
    res.status(200).json({success:true, data: provider});
});


//@desc create new provider
//@route POST /api/v1/providers
//@access Private (Admin)
exports.createProvider = asyncHandler(async(req, res, next)=>{
    const provider = await Provider.create(req.body);
    res.status(201).json({success:true, data:provider});
});

//@desc Update Provider
//@route PUT /api/v1/providers/:id
//@access Private (Admin)
exports.updateProvider = asyncHandler(async(req, res, next)=>{
    const provider = await Provider.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!provider){
        return res.status(404).json({success:false, msg:'Provider not found'});
    }
    res.status(200).json({success:true, data: provider});
});

//@desc Delete Provider
//@route DELETE /api/v1/providers/:id
//access Private (Admin)
exports.deleteProvider = asyncHandler(async(req, res, next)=>{
    const provider = await Provider.findById(req.params.id);

    if(!provider){
        return res.status(404).json({success:false, msg:'Provider not found'});
    }

    await provider.deleteOne();
    res.status(200).json({success:true, data: {} });
});
