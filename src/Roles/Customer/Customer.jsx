//<<<<<<< HEAD
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Customer() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Xem thông tin cá nhân",
      description: "Quản lý và xem chi tiết thông tin tài khoản cá nhân.",
      image: "https://cdn-icons-gif.flaticon.com/10635/10635873.gif",
      path: "/customer/profile",
    },
    {
      title: "Đặt lịch bảo dưỡng / bảo hành",
      description: "Đặt lịch hẹn tại trung tâm dịch vụ nhanh chóng và tiện lợi.",
      image: "https://cdn-icons-gif.flaticon.com/19013/19013045.gif",
      path: "/booking", // đường dẫn đến trang booking
    },
    {
      title: "Xem kết quả bảo hành",
      description: "Theo dõi tình trạng và kết quả xử lý yêu cầu bảo hành.",
      image: "https://cdn-icons-gif.flaticon.com/19013/19013039.gif",
      path: "/customer/warranty-result",
    },
    {
      title: "Xem lịch sử bảo hành",
      description: "Xem toàn bộ lịch sử bảo dưỡng và bảo hành của xe.",
      image: "https://cdn-icons-gif.flaticon.com/6454/6454228.gif",
      path: "/customer/warranty-history",
    },
    {
      title: "Xem thời hạn bảo hành phụ tùng",
      description: "Theo dõi danh sách phụ tùng còn trong thời hạn bảo hành.",
      image: "https://cdn-icons-gif.flaticon.com/10872/10872282.gif",
      path: "/customer/parts-warranty",
    },
  ];

  return (
    <div style={{ padding: "40px", background: "linear-gradient(135deg, #325f65ff 0%, #e8f5e9 100%)", minHeight: "100vh" }}>
      <h1 style={{ color: "#000000ff", marginBottom: "10px" }}>
        Chào mừng khách hàng đến với trung tâm bảo dưỡng & bảo hành xe điện
      </h1>
      <p style={{ marginBottom: "30px", color: "#0b0a0aff", fontSize: "16px" }}>
        Quản lý dịch vụ và thông tin bảo hành xe của bạn
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "25px",
        }}
      >
        {features.map((item, index) => (
          <div
            key={index}
            style={{
              background: "#fff",
              borderRadius: "15px",
              overflow: "hidden",
              boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
              transition: "0.3s",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={() => item.path && navigate(item.path)} // chuyển trang khi có path
            onMouseOver={(e) => (e.currentTarget.style.transform = "translateY(-8px)")}
            onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <img
              src={item.image}
              alt={item.title}
              style={{
                width: "100%",
                height: "180px",
                objectFit: "contain",
                background: "#ffffffff",
                padding: "20px",
              }}
            />
            <div style={{ padding: "20px", flex: 1 }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#044835" }}>{item.title}</h3>
              <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
//=======
// import React from "react";

// export default function Customer() {
//   const features = [
//     {
//       title: "Đặt lịch bảo dưỡng / bảo hành",
//       description: "Đặt lịch hẹn tại trung tâm dịch vụ nhanh chóng và tiện lợi.",
//       image:
//         "https://cdn-icons-gif.flaticon.com/19013/19013045.gif", // calendar
//     },
//     {
//       title: "Xem kết quả bảo hành",
//       description: "Theo dõi tình trạng và kết quả xử lý yêu cầu bảo hành.",
//       image:
//         "https://cdn-icons-gif.flaticon.com/19013/19013039.gif", // report
//     },
//     {
//       title: "Xem lịch sử bảo hành",
//       description: "Xem toàn bộ lịch sử bảo dưỡng và bảo hành của xe.",
//       image:
//         "https://cdn-icons-gif.flaticon.com/6454/6454228.gif", // history
//     },
//     {
//       title: "Xem thời hạn bảo hành phụ tùng",
//       description: "Theo dõi danh sách phụ tùng còn trong thời hạn bảo hành.",
//       image:
//         "https://cdn-icons-gif.flaticon.com/10872/10872282.gif", // car parts
//     },
//   ];

//   return (
//     <div style={{ padding: "40px", background: "linear-gradient(135deg, #325f65ff 0%, #e8f5e9 100%)", minHeight: "100vh" }}>
//       <h1 style={{ color: "#000000ff", marginBottom: "10px" }}>
//         Chào mừng khách hàng đến với trung tâm bảo dưỡng & bảo hành xe điện
//       </h1>
//       <p style={{ marginBottom: "30px", color: "#0b0a0aff", fontSize: "16px" }}>
//         Quản lý dịch vụ và thông tin bảo hành xe của bạn
//       </p>

//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
//           gap: "25px",
//         }}
//       >
//         {features.map((item, index) => (
//           <div
//             key={index}
//             style={{
//               background: "#fff",
//               borderRadius: "15px",
//               overflow: "hidden",
//               boxShadow: "0 6px 15px rgba(0,0,0,0.1)",
//               transition: "0.3s",
//               cursor: "pointer",
//               display: "flex",
//               flexDirection: "column",
//             }}
//             onMouseOver={(e) =>
//               (e.currentTarget.style.transform = "translateY(-8px)")
//             }
//             onMouseOut={(e) =>
//               (e.currentTarget.style.transform = "translateY(0)")
//             }
//           >
//             <img
//               src={item.image}
//               alt={item.title}
//               style={{
//                 width: "100%",
//                 height: "180px",
//                 objectFit: "contain",
//                 background: "#ffffffff",
//                 padding: "20px",
//               }}
//             />
//             <div style={{ padding: "20px", flex: 1 }}>
//               <h3 style={{ margin: "0 0 10px 0", color: "#044835" }}>
//                 {item.title}
//               </h3>
//               <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
//                 {item.description}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
// >>>>>>> thinh_recover
