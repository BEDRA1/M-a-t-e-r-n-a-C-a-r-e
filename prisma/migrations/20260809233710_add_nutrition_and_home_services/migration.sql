-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('lunch', 'dinner');

-- CreateEnum
CREATE TYPE "MealOrderStatus" AS ENUM ('pending', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled');

-- CreateEnum
CREATE TYPE "ServiceBookingStatus" AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "weekly_meals" (
    "id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "meal_type" "MealType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "image_url" TEXT,
    "week_start_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_price" INTEGER NOT NULL,
    "delivery_address" TEXT NOT NULL,
    "preferred_time" TIMESTAMP(3) NOT NULL,
    "status" "MealOrderStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "meal_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "meal_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" INTEGER NOT NULL,

    CONSTRAINT "meal_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "home_services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "base_price" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "home_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_bookings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "notes" TEXT,
    "status" "ServiceBookingStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weekly_meals_week_start_date_idx" ON "weekly_meals"("week_start_date");

-- CreateIndex
CREATE INDEX "meal_orders_user_id_idx" ON "meal_orders"("user_id");

-- CreateIndex
CREATE INDEX "meal_order_items_order_id_idx" ON "meal_order_items"("order_id");

-- CreateIndex
CREATE INDEX "home_services_category_idx" ON "home_services"("category");

-- CreateIndex
CREATE INDEX "service_bookings_user_id_idx" ON "service_bookings"("user_id");

-- AddForeignKey
ALTER TABLE "meal_orders" ADD CONSTRAINT "meal_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_order_items" ADD CONSTRAINT "meal_order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "meal_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_order_items" ADD CONSTRAINT "meal_order_items_meal_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "weekly_meals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_bookings" ADD CONSTRAINT "service_bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_bookings" ADD CONSTRAINT "service_bookings_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "home_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
