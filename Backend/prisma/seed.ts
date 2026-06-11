import {
  PrismaClient,
  Role,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ReservationStatus,
  OrderType
} from "@prisma/client";

import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ======================================================
  // CLEAN DATABASE
  // ======================================================

  await prisma.receipt.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItemIngredient.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.inventoryLog.deleteMany();
  await prisma.reorderRequest.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.restaurantTable.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();

  // ======================================================
  // PASSWORDS
  // ======================================================

  const adminPassword = await bcrypt.hash("Admin123", 12);

  const hqPassword = await bcrypt.hash("Headquarters123", 12);

  const managerPassword = await bcrypt.hash("Manager123", 12);

  const kitchenPassword = await bcrypt.hash("Kitchen123", 12);

  const inventoryPassword = await bcrypt.hash("Inventory123", 12);

  const waiterPassword = await bcrypt.hash("Waiter123", 12);

  const customerPassword = await bcrypt.hash("Customer123", 12);

  // ======================================================
  // BRANCHES
  // ======================================================

  await prisma.branch.createMany({
    data: [
      {
        id: 1,
        name: "Manchester",
        city: "Manchester",
        address: "Manchester City Centre",
        phone: "+44 111 111 111",
        openingHours: "10AM - 11PM",
        description: "Luxury steakhouse in Manchester"
      },

      {
        id: 2,
        name: "Birmingham",
        city: "Birmingham",
        address: "Birmingham City Centre",
        phone: "+44 333 333 333",
        openingHours: "10AM - 11PM",
        description: "Premium dining in Birmingham"
      },

      {
        id: 3,
        name: "Cardiff",
        city: "Cardiff",
        address: "Cardiff Centre",
        phone: "+44 666 666 666",
        openingHours: "10AM - 11PM",
        description: "Exclusive Cardiff steakhouse"
      },

      {
        id: 4,
        name: "Edinburgh",
        city: "Edinburgh",
        address: "Edinburgh Centre",
        phone: "+44 555 555 555",
        openingHours: "10AM - 11PM",
        description: "Elegant Edinburgh dining"
      },

      {
        id: 5,
        name: "Leeds",
        city: "Leeds",
        address: "Leeds City Centre",
        phone: "+44 444 444 444",
        openingHours: "10AM - 11PM",
        description: "Modern Leeds steakhouse"
      },

      {
        id: 6,
        name: "London",
        city: "London",
        address: "Central London",
        phone: "+44 222 222 222",
        openingHours: "10AM - 11PM",
        description: "Flagship London branch"
      }
    ]
  });

  console.log("✅ Branches seeded");

  // ======================================================
  // USERS
  // ======================================================

  await prisma.user.createMany({
    data: [
      // ================= ADMIN =================

      {
        fullName: "System Admin",
        email: "admin@steakz.co.uk",
        password: adminPassword,
        role: Role.ADMIN
      },

      {
        fullName: "Olivia Bennett",
        email: "hq@steakz.co.uk",
        password: hqPassword,
        role: Role.HEADQUARTERS_MANAGER
      },

      // ================= BRANCH MANAGERS =================

      {
        fullName: "Marcus Reed",
        email: "manchester.manager@steakz.co.uk",
        password: managerPassword,
        role: Role.BRANCH_MANAGER,
        branchId: 1
      },

      {
        fullName: "Sofia Patel",
        email: "birmingham.manager@steakz.co.uk",
        password: managerPassword,
        role: Role.BRANCH_MANAGER,
        branchId: 2
      },

      {
        fullName: "Ava Morgan",
        email: "cardiff.manager@steakz.co.uk",
        password: managerPassword,
        role: Role.BRANCH_MANAGER,
        branchId: 3
      },

      {
        fullName: "Olivia Mack",
        email: "edinburgh.manager@steakz.co.uk",
        password: managerPassword,
        role: Role.BRANCH_MANAGER,
        branchId: 4
      },

      {
        fullName: "Noah Reed",
        email: "leeds.manager@steakz.co.uk",
        password: managerPassword,
        role: Role.BRANCH_MANAGER,
        branchId: 5
      },

      {
        fullName: "London Manager",
        email: "london.manager@steakz.co.uk",
        password: managerPassword,
        role: Role.BRANCH_MANAGER,
        branchId: 6
      },

      // ================= KITCHEN STAFF =================

      {
        fullName: "Manchester Chef",
        email: "manchester.kitchen@steakz.co.uk",
        password: kitchenPassword,
        role: Role.KITCHEN_STAFF,
        branchId: 1
      },

      {
        fullName: "Birmingham Chef",
        email: "birmingham.kitchen@steakz.co.uk",
        password: kitchenPassword,
        role: Role.KITCHEN_STAFF,
        branchId: 2
      },

      {
        fullName: "Cardiff Chef",
        email: "cardiff.kitchen@steakz.co.uk",
        password: kitchenPassword,
        role: Role.KITCHEN_STAFF,
        branchId: 3
      },

      {
        fullName: "Edinburgh Chef",
        email: "edinburgh.kitchen@steakz.co.uk",
        password: kitchenPassword,
        role: Role.KITCHEN_STAFF,
        branchId: 4
      },

      {
        fullName: "Leeds Chef",
        email: "leeds.kitchen@steakz.co.uk",
        password: kitchenPassword,
        role: Role.KITCHEN_STAFF,
        branchId: 5
      },

      {
        fullName: "Chef Marcus",
        email: "kitchen@steakz.co.uk",
        password: kitchenPassword,
        role: Role.KITCHEN_STAFF,
        branchId: 6
      },

// ================= GLOBAL INVENTORY MANAGER =================

{
  fullName: "Senior Inventory Analyst",
  email: "inventory@steakz.co.uk",
  password: inventoryPassword,
  role: Role.INVENTORY_MANAGER
},
      // ================= WAITERS =================

      {
        fullName: "Manchester Waiter",
        email: "manchester.waiter@steakz.co.uk",
        password: waiterPassword,
        role: Role.WAITER,
        branchId: 1
      },

      {
        fullName: "Birmingham Waiter",
        email: "birmingham.waiter@steakz.co.uk",
        password: waiterPassword,
        role: Role.WAITER,
        branchId: 2
      },

      {
        fullName: "Cardiff Waiter",
        email: "cardiff.waiter@steakz.co.uk",
        password: waiterPassword,
        role: Role.WAITER,
        branchId: 3
      },

      {
        fullName: "Edinburgh Waiter",
        email: "edinburgh.waiter@steakz.co.uk",
        password: waiterPassword,
        role: Role.WAITER,
        branchId: 4
      },

      {
        fullName: "Leeds Waiter",
        email: "leeds.waiter@steakz.co.uk",
        password: waiterPassword,
        role: Role.WAITER,
        branchId: 5
      },

      {
        fullName: "Lucy",
        email: "waiter@steakz.co.uk",
        password: waiterPassword,
        role: Role.WAITER,
        branchId: 6
      },

      // ================= CUSTOMERS =================

      {
        fullName: "Troy",
        email: "troy@123.com",
        password: customerPassword,
        role: Role.CUSTOMER
      },

      {
        fullName: "Sarah Johnson",
        email: "sarah@customer.com",
        password: customerPassword,
        role: Role.CUSTOMER
      },

      {
        fullName: "Michael Brown",
        email: "michael@customer.com",
        password: customerPassword,
        role: Role.CUSTOMER
      },

      {
        fullName: "Emily Davis",
        email: "emily@customer.com",
        password: customerPassword,
        role: Role.CUSTOMER
      }
    ]
  });

  console.log("✅ Users seeded");

  // ======================================================
  // MENU ITEMS (GLOBAL MENU)
  // ======================================================

  const wagyu = await prisma.menuItem.create({
    data: {
      name: "Wagyu Ribeye",
      description: "Premium Japanese Wagyu Ribeye",
      category: "STEAK",
      price: 65,
      available: true,
      branchId: null
    }
  });

  const fillet = await prisma.menuItem.create({
    data: {
      name: "Charred Fillet",
      description: "Tender chargrilled fillet steak",
      category: "STEAK",
      price: 48,
      available: true,
      branchId: null
    }
  });

  const fries = await prisma.menuItem.create({
    data: {
      name: "Truffle Fries",
      description: "Crispy fries with truffle butter",
      category: "SIDES",
      price: 14,
      available: true,
      branchId: null
    }
  });

  const scallops = await prisma.menuItem.create({
    data: {
      name: "Seared Scallops",
      description: "Fresh scallops with butter glaze",
      category: "SEAFOOD",
      price: 28,
      available: true,
      branchId: null
    }
  });

  const wine = await prisma.menuItem.create({
    data: {
      name: "Red Wine",
      description: "Premium house red wine",
      category: "DRINKS",
      price: 18,
      available: true,
      branchId: null
    }
  });

  console.log("✅ Menu items seeded");

  // ======================================================
  // INVENTORY + TABLES PER BRANCH
  // ======================================================

  for (let branchId = 1; branchId <= 6; branchId++) {
    const wagyuStock = await prisma.inventory.create({
      data: {
        name: "Wagyu Fillet Portions",
        quantity: 100,
        unit: "portions",
        minimumLevel: 20,
        criticalLevel: 10,
        branchId
      }
    });

    const ribeyeStock = await prisma.inventory.create({
      data: {
        name: "Ribeye Cut Portions",
        quantity: 100,
        unit: "portions",
        minimumLevel: 20,
        criticalLevel: 10,
        branchId
      }
    });

    const butterStock = await prisma.inventory.create({
      data: {
        name: "Truffle Butter Units",
        quantity: 300,
        unit: "units",
        minimumLevel: 50,
        criticalLevel: 20,
        branchId
      }
    });

    const friesStock = await prisma.inventory.create({
      data: {
        name: "Fries Servings",
        quantity: 200,
        unit: "servings",
        minimumLevel: 40,
        criticalLevel: 15,
        branchId
      }
    });

    const scallopStock = await prisma.inventory.create({
      data: {
        name: "Scallop Pieces",
        quantity: 150,
        unit: "pieces",
        minimumLevel: 30,
        criticalLevel: 10,
        branchId
      }
    });

    // ======================================================
    // INGREDIENT MAPPINGS
    // ======================================================

    await prisma.menuItemIngredient.createMany({
      data: [
        {
          menuItemId: wagyu.id,
          inventoryId: wagyuStock.id,
          quantityNeeded: 1
        },

        {
          menuItemId: wagyu.id,
          inventoryId: butterStock.id,
          quantityNeeded: 1
        },

        {
          menuItemId: fillet.id,
          inventoryId: ribeyeStock.id,
          quantityNeeded: 1
        },

        {
          menuItemId: fillet.id,
          inventoryId: butterStock.id,
          quantityNeeded: 1
        },

        {
          menuItemId: fries.id,
          inventoryId: friesStock.id,
          quantityNeeded: 1
        },

        {
          menuItemId: fries.id,
          inventoryId: butterStock.id,
          quantityNeeded: 1
        },

        {
          menuItemId: scallops.id,
          inventoryId: scallopStock.id,
          quantityNeeded: 4
        }
      ]
    });

    // ======================================================
    // TABLES
    // ======================================================

    for (let i = 1; i <= 20; i++) {
      await prisma.restaurantTable.create({
        data: {
          tableNumber: i,
          seats: 4,
          branchId
        }
      });
    }
  }

  console.log("✅ Inventory + tables seeded");

  // ======================================================
  // CUSTOMER
  // ======================================================

  const customer = await prisma.user.findUnique({
    where: {
      email: "troy@123.com"
    }
  });

  // ======================================================
  // SAMPLE ORDER
  // ======================================================

  const order = await prisma.order.create({
    data: {
      tableNumber: 5,
      total: 93,
      status: OrderStatus.PAID,
      orderType: OrderType.DINE_IN,
      guestCount: 2,
      branchId: 6,
      customerId: customer!.id,

      items: {
        create: [
          {
            menuItemId: wagyu.id,
            quantity: 1,
            price: 65
          },

          {
            menuItemId: fries.id,
            quantity: 2,
            price: 14
          }
        ]
      }
    },

    include: {
      items: true
    }
  });

  console.log("✅ Orders seeded");

  // ======================================================
  // PAYMENT
  // ======================================================

  await prisma.payment.create({
    data: {
      amount: 93,
      paymentMethod: PaymentMethod.CARD,
      status: PaymentStatus.PAID,
      orderId: order.id,
      branchId: 6
    }
  });

  // ======================================================
  // RECEIPT
  // ======================================================

  await prisma.receipt.create({
    data: {
      receiptNo: `RCPT-${Date.now()}`,
      subtotal: 93,
      taxAmount: 0,
      serviceCharge: 0,
      total: 93,
      paymentMethod: PaymentMethod.CARD,
      orderId: order.id,
      branchId: 6
    }
  });

  console.log("✅ Receipts seeded");

  // ======================================================
  // RESERVATION
  // ======================================================

  await prisma.reservation.create({
    data: {
      customerName: "Troy",
      customerEmail: "troy@123.com",
      customerPhone: "+44 777 777 777",
      guests: 2,
      reservationTime: new Date(Date.now() + 86400000),
      specialRequests: "Window seat",
      status: ReservationStatus.PENDING,
      branchId: 6,
      customerId: customer!.id
    }
  });

  console.log("✅ Reservations seeded");

  console.log("🎉 DATABASE SEEDED SUCCESSFULLY!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });