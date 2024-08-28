import Address from "../database/models/address.js";

// Create a new address
export const createAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, phone, addressLine, area, landmark, city, state, pincode } =
      req.body;

    const newAddress = new Address({
      userId,
      name,
      phone,
      addressLine,
      area,
      landmark,
      city,
      state,
      pincode,
    });

    await newAddress.save();
    res
      .status(201)
      .json({ message: "Address created successfully", address: newAddress });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create address", error: error.message });
  }
};

// Update an existing address
export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { name, phone, addressLine, area, landmark, city, state, pincode } =
      req.body;

    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      {
        name,
        phone,
        addressLine,
        area,
        landmark,
        city,
        state,
        pincode,
      },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({
      message: "Address updated successfully",
      address: updatedAddress,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update address", error: error.message });
  }
};

// Delete an address
export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;

    const deletedAddress = await Address.findByIdAndDelete(addressId);
    if (!deletedAddress) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({
      message: "Address deleted successfully",
      address: deletedAddress,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete address", error: error.message });
  }
};

// Get all addresses for a user
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id;

    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ addresses });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch addresses", error: error.message });
  }
};

// Get a specific address by ID
export const getAddressById = async (req, res) => {
  try {
    const { addressId } = req.params;

    const address = await Address.findById(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.status(200).json({ address });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch address", error: error.message });
  }
};
