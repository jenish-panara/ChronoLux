const User = require('../models/User');

const MAX_ADDRESSES = 5;

// ─────────────────────────────────────────────
// @desc    Get all saved addresses
// @route   GET /api/addresses
// @access  Private
// ─────────────────────────────────────────────
exports.getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    // Return default first, then the rest
    const addresses = [...user.addresses].sort((a, b) => b.isDefault - a.isDefault);
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Add a new address
// @route   POST /api/addresses
// @access  Private
// ─────────────────────────────────────────────
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.addresses.length >= MAX_ADDRESSES) {
      return res.status(400).json({
        success: false,
        message: `You can save a maximum of ${MAX_ADDRESSES} addresses`,
      });
    }

    const { name, mobile, houseNo, area, city, state, pincode, isDefault } = req.body;

    // If this is the first address or explicitly set as default, make it default
    const shouldBeDefault = user.addresses.length === 0 || isDefault;

    if (shouldBeDefault) {
      // Unset existing defaults
      user.addresses.forEach((addr) => { addr.isDefault = false; });
    }

    user.addresses.push({
      name, mobile, houseNo, area, city, state, pincode,
      isDefault: shouldBeDefault,
    });

    await user.save();

    const newAddress = user.addresses[user.addresses.length - 1];

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      address: newAddress,
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Update an address
// @route   PUT /api/addresses/:id
// @access  Private
// ─────────────────────────────────────────────
exports.updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const { name, mobile, houseNo, area, city, state, pincode } = req.body;
    if (name) address.name = name;
    if (mobile) address.mobile = mobile;
    if (houseNo) address.houseNo = houseNo;
    if (area) address.area = area;
    if (city) address.city = city;
    if (state) address.state = state;
    if (pincode) address.pincode = pincode;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address,
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Private
// ─────────────────────────────────────────────
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const wasDefault = address.isDefault;
    user.addresses.pull(req.params.id);

    // If we deleted the default, make the first remaining one default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Set an address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
// ─────────────────────────────────────────────
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Unset all, then set the target
    user.addresses.forEach((addr) => { addr.isDefault = false; });
    address.isDefault = true;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Default address updated',
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
};
