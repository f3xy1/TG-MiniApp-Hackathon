using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TGMiniApp.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Nomenclatures",
                columns: table => new
                {
                    ID = table.Column<string>(type: "TEXT", nullable: false),
                    IDCat = table.Column<string>(type: "TEXT", nullable: true),
                    IDType = table.Column<string>(type: "TEXT", nullable: false),
                    IDTypeNew = table.Column<string>(type: "TEXT", nullable: true),
                    ProductionType = table.Column<string>(type: "TEXT", nullable: true),
                    IDFunctionType = table.Column<string>(type: "TEXT", nullable: true),
                    Name = table.Column<string>(type: "TEXT", nullable: true),
                    Gost = table.Column<string>(type: "TEXT", nullable: true),
                    FormOfLength = table.Column<string>(type: "TEXT", nullable: true),
                    Manufacturer = table.Column<string>(type: "TEXT", nullable: true),
                    SteelGrade = table.Column<string>(type: "TEXT", nullable: true),
                    Diameter = table.Column<double>(type: "REAL", nullable: false),
                    ProfileSize2 = table.Column<double>(type: "REAL", nullable: false),
                    PipeWallThickness = table.Column<double>(type: "REAL", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    Koef = table.Column<double>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Nomenclatures", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    FirstName = table.Column<string>(type: "TEXT", nullable: true),
                    LastName = table.Column<string>(type: "TEXT", nullable: true),
                    INN = table.Column<string>(type: "TEXT", nullable: true),
                    Phone = table.Column<string>(type: "TEXT", nullable: true),
                    Email = table.Column<string>(type: "TEXT", nullable: true),
                    TotalPrice = table.Column<double>(type: "REAL", nullable: false),
                    OrderDate = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Orders", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Prices",
                columns: table => new
                {
                    ID = table.Column<string>(type: "TEXT", nullable: false),
                    IDStock = table.Column<string>(type: "TEXT", nullable: false),
                    PriceT = table.Column<double>(type: "REAL", nullable: false),
                    PriceLimitT1 = table.Column<double>(type: "REAL", nullable: false),
                    PriceT1 = table.Column<double>(type: "REAL", nullable: false),
                    PriceLimitT2 = table.Column<double>(type: "REAL", nullable: false),
                    PriceT2 = table.Column<double>(type: "REAL", nullable: false),
                    PriceM = table.Column<double>(type: "REAL", nullable: false),
                    PriceLimitM1 = table.Column<double>(type: "REAL", nullable: false),
                    PriceM1 = table.Column<double>(type: "REAL", nullable: false),
                    PriceLimitM2 = table.Column<double>(type: "REAL", nullable: false),
                    PriceM2 = table.Column<double>(type: "REAL", nullable: false),
                    NDS = table.Column<double>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Prices", x => new { x.ID, x.IDStock });
                });

            migrationBuilder.CreateTable(
                name: "Remnants",
                columns: table => new
                {
                    ID = table.Column<string>(type: "TEXT", nullable: false),
                    IDStock = table.Column<string>(type: "TEXT", nullable: false),
                    InStockT = table.Column<double>(type: "REAL", nullable: false),
                    InStockM = table.Column<double>(type: "REAL", nullable: false),
                    SoonArriveT = table.Column<double>(type: "REAL", nullable: false),
                    SoonArriveM = table.Column<double>(type: "REAL", nullable: false),
                    ReservedT = table.Column<double>(type: "REAL", nullable: false),
                    ReservedM = table.Column<double>(type: "REAL", nullable: false),
                    UnderTheOrder = table.Column<bool>(type: "INTEGER", nullable: false),
                    AvgTubeLength = table.Column<double>(type: "REAL", nullable: false),
                    AvgTubeWeight = table.Column<double>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Remnants", x => new { x.ID, x.IDStock });
                });

            migrationBuilder.CreateTable(
                name: "Stocks",
                columns: table => new
                {
                    IDStock = table.Column<string>(type: "TEXT", nullable: false),
                    StockCity = table.Column<string>(type: "TEXT", nullable: false),
                    StockName = table.Column<string>(type: "TEXT", nullable: true),
                    Address = table.Column<string>(type: "TEXT", nullable: true),
                    Schedule = table.Column<string>(type: "TEXT", nullable: true),
                    IDDivision = table.Column<string>(type: "TEXT", nullable: true),
                    CashPayment = table.Column<bool>(type: "INTEGER", nullable: false),
                    CardPayment = table.Column<bool>(type: "INTEGER", nullable: false),
                    FIASId = table.Column<string>(type: "TEXT", nullable: true),
                    OwnerInn = table.Column<string>(type: "TEXT", nullable: true),
                    OwnerKpp = table.Column<string>(type: "TEXT", nullable: true),
                    OwnerFullName = table.Column<string>(type: "TEXT", nullable: true),
                    OwnerShortName = table.Column<string>(type: "TEXT", nullable: true),
                    RailwayStation = table.Column<string>(type: "TEXT", nullable: true),
                    ConsigneeCode = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Stocks", x => x.IDStock);
                });

            migrationBuilder.CreateTable(
                name: "Types",
                columns: table => new
                {
                    IDType = table.Column<string>(type: "TEXT", nullable: false),
                    TypeName = table.Column<string>(type: "TEXT", nullable: false),
                    IDParentType = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Types", x => x.IDType);
                });

            migrationBuilder.CreateTable(
                name: "CartItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    NomenclatureID = table.Column<string>(type: "TEXT", nullable: true),
                    StockID = table.Column<string>(type: "TEXT", nullable: true),
                    QuantityTons = table.Column<double>(type: "REAL", nullable: false),
                    QuantityMeters = table.Column<double>(type: "REAL", nullable: false),
                    Price = table.Column<double>(type: "REAL", nullable: false),
                    OrderId = table.Column<int>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CartItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CartItems_Orders_OrderId",
                        column: x => x.OrderId,
                        principalTable: "Orders",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CartItems_OrderId",
                table: "CartItems",
                column: "OrderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CartItems");

            migrationBuilder.DropTable(
                name: "Nomenclatures");

            migrationBuilder.DropTable(
                name: "Prices");

            migrationBuilder.DropTable(
                name: "Remnants");

            migrationBuilder.DropTable(
                name: "Stocks");

            migrationBuilder.DropTable(
                name: "Types");

            migrationBuilder.DropTable(
                name: "Orders");
        }
    }
}
