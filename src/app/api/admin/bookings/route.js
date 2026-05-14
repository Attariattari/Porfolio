import { BookingController } from "@/controllers/BookingController";
import { authenticateAdminRequest } from "@/lib/adminAuth";
import { apiResponse, withErrorHandling } from "@/lib/apiResponse";
import { MessageQuerySchema } from "@/lib/validation";

export const GET = withErrorHandling(async (req) => {
  const auth = await authenticateAdminRequest(req);
  if (auth.error) {
    return apiResponse.error(auth.error.message, auth.error.status);
  }

  const { searchParams } = new URL(req.url);
  const queryParams = Object.fromEntries(searchParams.entries());
  
  // 1. Zod Validation
  const validatedQuery = MessageQuerySchema.parse(queryParams);

  // 2. Fetch Data
  const result = await BookingController.getAll(validatedQuery);
  
  return apiResponse.success(result, "Bookings retrieved successfully");
});
