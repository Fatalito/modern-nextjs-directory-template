import { cache } from "react";
import { userRepository } from "./index";

export const getAllUsers = cache(() => userRepository.getAll());

export const getUserById = cache((id: string) => userRepository.getById(id));
