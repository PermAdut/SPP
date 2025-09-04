import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import userApiInstance, { IUser } from "../../api/user.api";

interface UserState {
  isLoading: boolean;
  error: string | null;
  users: IUser[];
}

const initialState: UserState = {
  isLoading: false,
  error: null,
  users: [],
};

export const getAllUsers = createAsyncThunk<
  IUser[] | undefined,
  void,
  { rejectValue: string }
>("users/all", async (_: void, { rejectWithValue }) => {
  try {
    const users = await userApiInstance.getAll();
    return users;
  } catch (err: any) {
    rejectWithValue(err.message || "Failed to fetch");
  }
});

export const changeAdm = createAsyncThunk<
  IUser[] | undefined,
  { id: number; status: boolean },
  { rejectValue: string }
>(
  "users/change/adm",
  async (body: { id: number; status: boolean }, { rejectWithValue }) => {
    try {
      const users = await userApiInstance.changeAdminStatus(
        body.id,
        body.status
      );
      return users;
    } catch (err: any) {
      rejectWithValue(err.message || "Failed to change");
    }
  }
);

export const filterName = createAsyncThunk<
  IUser[] | undefined,
  { name: string },
  { rejectValue: string }
>("users/filter/name", async (body: { name: string }, { rejectWithValue }) => {
  try {
    const users = await userApiInstance.filterByName(body.name);
    return users;
  } catch (err: any) {
    rejectWithValue(err.message || "Failed to filter");
  }
});

export const filterSurname = createAsyncThunk<
  IUser[] | undefined,
  { surname: string },
  { rejectValue: string }
>(
  "users/filter/surname",
  async (body: { surname: string }, { rejectWithValue }) => {
    try {
      const users = await userApiInstance.filterBySurName(body.surname);
      return users;
    } catch (err: any) {
      rejectWithValue(err.message || "Failed to filter");
    }
  }
);

export const upload = createAsyncThunk<
  IUser[] | undefined,
  { id: number; photo: string },
  { rejectValue: string }
>(
  "users/upload",
  async (body: { id: number; photo: string }, { rejectWithValue }) => {
    try {
      const users = await userApiInstance.uploadPhoto(body.id, body.photo);
      return users;
    } catch (err: any) {
      rejectWithValue(err.message || "Failed to upload");
    }
  }
);

export const changeAddData = createAsyncThunk<
  IUser[] | undefined,
  { id: number; data: string },
  { rejectValue: string }
>(
  "users/addData",
  async (body: { id: number; data: string }, { rejectWithValue }) => {
    try {
      const users = await userApiInstance.changeAdditionalData(
        body.id,
        body.data
      );
      return users;
    } catch (err: any) {
      rejectWithValue(err.message || "Failed to upload");
    }
  }
);

const userSlice = createSlice({
  name: "users",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllUsers.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getAllUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.users = [];
    });
    builder.addCase(getAllUsers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload ? action.payload : [];
    });
    builder.addCase(changeAdm.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(changeAdm.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.users = [];
    });
    builder.addCase(changeAdm.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload ? action.payload : [];
    });
    builder.addCase(filterName.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(filterName.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.users = [];
    });
    builder.addCase(filterName.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload ? action.payload : [];
    });
    builder.addCase(filterSurname.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(filterSurname.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.users = [];
    });
    builder.addCase(filterSurname.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload ? action.payload : [];
    });
    builder.addCase(upload.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(upload.rejected, (state, action) => {
      state.error = action.payload as string;
      state.isLoading = false;
      state.users = [];
    });
    builder.addCase(upload.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload ? action.payload : [];
    });
    builder.addCase(changeAddData.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(changeAddData.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.users = [];
    });
    builder.addCase(changeAddData.fulfilled, (state, action) => {
      state.isLoading = false;
      state.users = action.payload ? action.payload : [];
    });
  },
});

export default userSlice.reducer;
